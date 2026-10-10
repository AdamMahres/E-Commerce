import express from "express";
import pool from "../config/db.js";

const router = express.Router()

router.get('/categories', async (req, res) => {
    const result = await pool.query(
        'select distinct category from products where category is not null order by category'
    )
    return res.status(200).json({ categories: result.rows.map(row => row.category) })
})

router.get('/', async (req, res) => {
    const { search, category } = req.query
    const conditions = []
    const params = []

    if (search) {
        params.push(`%${search}%`)
        conditions.push(`title ilike $${params.length}`)
    }
    if (category) {
        params.push(category)
        conditions.push(`category = $${params.length}`)
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

    const result = await pool.query(
        `select api_product_id as id, title, price, image, category from products ${whereClause} order by api_product_id`,
        params
    )
    return res.status(200).json({ products: result.rows })
})

router.get('/:id', async (req, res) => {
    const result = await pool.query(
        'select api_product_id as id, title, price, image, description from products where api_product_id=$1',
        [req.params.id]
    )
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "product not found" })
    }
    return res.status(200).json({ product: result.rows[0] })
})

export default router
