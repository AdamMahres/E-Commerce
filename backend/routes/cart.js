import express from "express";
import pool from "../config/db.js";
import jwt from 'jsonwebtoken'

const router = express.Router()

const requireAuth = (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "please log in" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.id
        next()
    } catch (error) {
        return res.status(401).json({ message: "please log in" })
    }
}

const getOrCreateCartId = async (userId) => {
    const existing = await pool.query('select id from carts where user_id=$1', [userId])
    if (existing.rows.length > 0) {
        return existing.rows[0].id
    }
    const created = await pool.query('insert into carts (user_id) values ($1) returning id', [userId])
    return created.rows[0].id
}

router.get('/', requireAuth, async (req, res) => {
    const cartId = await getOrCreateCartId(req.userId)
    const result = await pool.query(
        `select p.api_product_id as id, p.title, p.price, p.image, ci.quantity
         from cart_items ci
         join products p on p.id = ci.product_id
         where ci.cart_id = $1`,
        [cartId]
    )
    return res.status(200).json({ cartItems: result.rows })
})

router.post("/item", requireAuth, async (req, res) => {
    const {id, title , price, image} = req.body

    if([id, title, price, image].some(element => !element)){
        return res.status(400).json({message: "missing required fields"})
    }

    const productExists = await pool.query("select * from products where api_product_id=$1",[id])

    let product = productExists.rows[0];
    if (!product) {
        const insertResult = await pool.query(
            'INSERT INTO products (api_product_id, title, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, title, price, image]
        );
        product = insertResult.rows[0];
    }

    const cartId = await getOrCreateCartId(req.userId)

    const result = await pool.query(
        `insert into cart_items (cart_id, product_id, quantity)
         values ($1, $2, 1)
         on conflict (cart_id, product_id) do update set quantity = cart_items.quantity + 1
         returning quantity`,
        [cartId, product.id]
    )

    return res.status(200).json({id: product.api_product_id, quantity: result.rows[0].quantity})
})

router.patch("/item/:productId", requireAuth, async (req, res) => {
    const apiProductId = req.params.productId
    const { quantity } = req.body

    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "quantity must be a positive integer" })
    }

    const cartId = await getOrCreateCartId(req.userId)
    const result = await pool.query(
        `update cart_items ci
         set quantity = $1
         from products p
         where ci.product_id = p.id
           and p.api_product_id = $2
           and ci.cart_id = $3
         returning ci.quantity`,
        [quantity, apiProductId, cartId]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "item not found in cart" })
    }

    return res.status(200).json({ id: apiProductId, quantity: result.rows[0].quantity })
})

router.delete("/item/:productId", requireAuth, async (req, res) => {
    const apiProductId = req.params.productId
    const cartId = await getOrCreateCartId(req.userId)

    await pool.query(
        `delete from cart_items
         using products p
         where cart_items.product_id = p.id
           and p.api_product_id = $1
           and cart_items.cart_id = $2`,
        [apiProductId, cartId]
    )

    return res.status(200).json({ message: "removed" })
})


export default router
