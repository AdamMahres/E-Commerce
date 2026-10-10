import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

export const requireAuth = (req, res, next) => {
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

// Always re-checks is_admin against the DB rather than trusting anything in the
// JWT payload (which only ever carries {id}), so revoking admin access takes
// effect immediately instead of waiting for the token to expire.
export const requireAdmin = async (req, res, next) => {
    const result = await pool.query('select is_admin from users where id=$1', [req.userId])
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
        return res.status(403).json({ message: "admin access required" })
    }
    next()
}
