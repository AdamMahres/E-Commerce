import express from "express";
import pool from "../config/db.js";
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'

const router = express.Router()

// Created lazily (not at module load) so a missing/unset STRIPE_SECRET_KEY only
// breaks checkout, not the entire backend (auth, cart, products would otherwise
// go down too since this file is imported by server.js at startup).
let stripeClient = null
const getStripeClient = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    if (!stripeClient) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
    }
    return stripeClient
}

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

router.get('/', requireAuth, async (req, res) => {
    const result = await pool.query(
        `select o.id, o.status, o.total_amount, o.created_at, count(oi.id) as item_count
         from orders o
         left join order_items oi on oi.order_id = o.id
         where o.user_id = $1
         group by o.id
         order by o.created_at desc`,
        [req.userId]
    )
    return res.status(200).json({ orders: result.rows })
})

router.post('/checkout', requireAuth, async (req, res) => {
    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phone } = req.body

    if (!fullName || !addressLine1 || !city || !postalCode || !country) {
        return res.status(400).json({ message: "please fill in all required shipping fields" })
    }

    const cartResult = await pool.query('select id from carts where user_id=$1', [req.userId])
    if (cartResult.rows.length === 0) {
        return res.status(400).json({ message: "your cart is empty" })
    }
    const cartId = cartResult.rows[0].id

    // Always read the cart from the DB, never trust cart contents/prices sent by the client
    const itemsResult = await pool.query(
        `select p.id as product_id, p.title, p.price, p.image, ci.quantity
         from cart_items ci
         join products p on p.id = ci.product_id
         where ci.cart_id = $1`,
        [cartId]
    )

    if (itemsResult.rows.length === 0) {
        return res.status(400).json({ message: "your cart is empty" })
    }

    const totalAmount = itemsResult.rows.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    )

    const orderResult = await pool.query(
        `insert into orders
            (user_id, status, full_name, address_line1, address_line2, city, state, postal_code, country, phone, total_amount)
         values ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10)
         returning id`,
        [req.userId, fullName, addressLine1, addressLine2 || null, city, state || null, postalCode, country, phone || null, totalAmount.toFixed(2)]
    )
    const orderId = orderResult.rows[0].id

    for (const item of itemsResult.rows) {
        await pool.query(
            `insert into order_items (order_id, product_id, product_title, product_image, unit_price, quantity)
             values ($1, $2, $3, $4, $5, $6)`,
            [orderId, item.product_id, item.title, item.image, item.price, item.quantity]
        )
    }

    try {
        const stripe = getStripeClient()
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: itemsResult.rows.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: item.title },
                    unit_amount: Math.round(Number(item.price) * 100)
                },
                quantity: item.quantity
            })),
            success_url: `${process.env.FRONTEND_URL}/order-confirmation/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout`
        })

        await pool.query('update orders set stripe_session_id=$1 where id=$2', [session.id, orderId])

        return res.status(200).json({ url: session.url })
    } catch (stripeError) {
        // Order/order_items were already inserted above (order_items needs its own
        // insert per row, so it can't share the outer transaction-less flow). If
        // Stripe fails to start a session, roll that back rather than leaving an
        // orphaned "pending" order with no way to ever be paid.
        console.error(stripeError)
        await pool.query('delete from orders where id=$1', [orderId])
        return res.status(500).json({ message: "something went wrong starting payment" })
    }
})

router.get('/:id/confirm', requireAuth, async (req, res) => {
    const orderId = req.params.id
    const sessionId = req.query.session_id

    const orderResult = await pool.query(
        'select * from orders where id=$1 and user_id=$2',
        [orderId, req.userId]
    )
    if (orderResult.rows.length === 0) {
        return res.status(404).json({ message: "order not found" })
    }
    let order = orderResult.rows[0]

    // We confirm payment here (on the success-page load) instead of via a Stripe
    // webhook. That's a deliberate simplification for local/test-mode dev, where
    // there's no publicly reachable URL for Stripe to call without an ngrok/stripe-cli
    // tunnel. The tradeoff: if a user pays but closes the tab before this page loads,
    // the order stays "pending" forever. A webhook is the production upgrade path —
    // it hears from Stripe directly regardless of what the browser does.
    if (order.status !== 'paid' && sessionId) {
        const stripe = getStripeClient()
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        if (session.id === order.stripe_session_id && session.payment_status === 'paid') {
            await pool.query("update orders set status='paid' where id=$1", [orderId])
            const cartResult = await pool.query('select id from carts where user_id=$1', [req.userId])
            if (cartResult.rows.length > 0) {
                await pool.query('delete from cart_items where cart_id=$1', [cartResult.rows[0].id])
            }
            order.status = 'paid'
        }
    }

    const itemsResult = await pool.query('select * from order_items where order_id=$1', [orderId])
    return res.status(200).json({ order, items: itemsResult.rows })
})

router.get('/:id', requireAuth, async (req, res) => {
    const orderResult = await pool.query(
        'select * from orders where id=$1 and user_id=$2',
        [req.params.id, req.userId]
    )
    if (orderResult.rows.length === 0) {
        return res.status(404).json({ message: "order not found" })
    }
    const itemsResult = await pool.query('select * from order_items where order_id=$1', [req.params.id])
    return res.status(200).json({ order: orderResult.rows[0], items: itemsResult.rows })
})

export default router
