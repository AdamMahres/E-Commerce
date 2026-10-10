import express from "express";
import pool from "../config/db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router()

// Every route in this file is behind both of these, applied once here rather
// than per-route, so a new route can't accidentally be added unprotected.
router.use(requireAuth, requireAdmin)

const validateProductInput = ({ title, price, image }) => {
    if (!title || !String(title).trim()) {
        return "title is required"
    }
    if (!image || !String(image).trim()) {
        return "image URL is required"
    }
    if (price === undefined || price === null || price === '' || isNaN(Number(price)) || Number(price) <= 0) {
        return "price must be a positive number"
    }
    return null
}

router.get('/products', async (req, res) => {
    const result = await pool.query(
        'select api_product_id as id, title, price, image, description, category from products order by api_product_id'
    )
    return res.status(200).json({ products: result.rows })
})

router.post('/products', async (req, res) => {
    const { title, price, image, description, category } = req.body

    const validationError = validateProductInput({ title, price, image })
    if (validationError) {
        return res.status(400).json({ message: validationError })
    }

    // Admin-created products have no fakestore id to key off of. Offset by 1,000,000
    // so these synthetic ids can never collide with real fakestore ids (small integers,
    // currently ~1-20) that db/seed.js writes into the same column.
    const result = await pool.query(
        `insert into products (api_product_id, title, price, image, description, category)
         values (1000000 + nextval('products_id_seq'), $1, $2, $3, $4, $5)
         returning api_product_id as id, title, price, image, description, category`,
        [title.trim(), Number(price).toFixed(2), image.trim(), description || null, category || null]
    )

    return res.status(201).json({ product: result.rows[0] })
})

router.put('/products/:id', async (req, res) => {
    const { title, price, image, description, category } = req.body

    const validationError = validateProductInput({ title, price, image })
    if (validationError) {
        return res.status(400).json({ message: validationError })
    }

    const result = await pool.query(
        `update products
         set title=$1, price=$2, image=$3, description=$4, category=$5
         where api_product_id=$6
         returning api_product_id as id, title, price, image, description, category`,
        [title.trim(), Number(price).toFixed(2), image.trim(), description || null, category || null, req.params.id]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "product not found" })
    }

    return res.status(200).json({ product: result.rows[0] })
})

router.delete('/products/:id', async (req, res) => {
    const productResult = await pool.query('select id from products where api_product_id=$1', [req.params.id])
    if (productResult.rows.length === 0) {
        return res.status(404).json({ message: "product not found" })
    }
    const productId = productResult.rows[0].id

    // order_items.product_id is ON DELETE SET NULL (schema.sql) so past orders keep
    // their snapshotted title/price/image regardless of what happens here. But
    // cart_items.product_id has no such clause (default RESTRICT) — deleting a product
    // that's sitting in a live cart would otherwise fail with a FK violation, so clear
    // it out of carts explicitly first.
    await pool.query('delete from cart_items where product_id=$1', [productId])
    await pool.query('delete from products where id=$1', [productId])

    return res.status(200).json({ message: "deleted" })
})

router.get('/orders', async (req, res) => {
    const result = await pool.query(
        `select o.id, o.status, o.total_amount, o.created_at,
                u.name as customer_name, u.email as customer_email,
                coalesce(
                    json_agg(
                        json_build_object(
                            'product_title', oi.product_title,
                            'quantity', oi.quantity,
                            'unit_price', oi.unit_price
                        ) order by oi.id
                    ) filter (where oi.id is not null),
                    '[]'
                ) as items
         from orders o
         join users u on u.id = o.user_id
         left join order_items oi on oi.order_id = o.id
         group by o.id, u.name, u.email
         order by o.created_at desc`
    )
    return res.status(200).json({ orders: result.rows })
})

export default router
