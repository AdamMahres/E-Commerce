import express from "express";
import pool from "../config/db.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = express.Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const cookieOptions = {
    httpOnly:true,
    secure:false, // to be changed later since it should be true in order to send cookies in https(secure)
    sameSite:'Lax',
    maxAge: 30*24*60*60*1000
}


// create jwt token

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET,{  // the sign should accept the payload and the secret key
        expiresIn: '30d'
    })
}

// 

router.post('/signup', async (req, res) => {
    const {email ,password ,name} = req.body
    if(!email ||!password ||!name ){
        return res.status(400).json({message:'please enter all the required fields'})
    }
    if(!EMAIL_REGEX.test(email)){
        return res.status(400).json({message:'please enter a valid email address'})
    }
    if(password.length < 6){
        return res.status(400).json({message:'password must be at least 6 characters'})
    }

    const user = await pool.query('select * from users where email=$1',[email])
    if(user.rows.length > 0){
        return res.status(400).json({message:'the user already exists'})
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await pool.query('insert into users (name,email,password) VALUES ($1,$2,$3) returning *',[name,email, hashedPassword])

    const token = generateToken(newUser.rows[0].id)
    res.cookie('token', token,cookieOptions)
    const { password: _password, ...userWithoutPassword } = newUser.rows[0]
    return res.status(201).json(userWithoutPassword)
})

router.post("/login", async (req, res) => {
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({message:'enter all the required fields'})
    }
    if(!EMAIL_REGEX.test(email)){
        return res.status(400).json({message:'please enter a valid email address'})
    }

    const user = await pool.query('select * from users where email=$1',[email])
    if(user.rows.length === 0){
        return res.status(400).json({message:'you need to sign up'})
    }

    const userData = user.rows[0]
    const isMatched = await bcrypt.compare(password, userData.password)
    if(!isMatched){
        return res.status(400).json({message:'the passord is incorrect try again'})
    }
    const token = generateToken(userData.id)
    res.cookie('token', token , cookieOptions)
    return res.status(200).json({id:userData.id, name: userData.name, email: userData.email, is_admin: userData.is_admin })

})


router.post('/logout',(req, res) => { 
    res.clearCookie('token')  // delete the jwt cookie
    res.json({message:'logged out'})
 })


router.get('/current-user', async (req, res) => {
  try {
    const token = req.cookies.token

    // no session cookie is a normal anonymous visit, not an error
    if (!token) {
      return res.status(200).json({ user: null })
    }

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    //  Get user from DB
    const user = await pool.query(
      'SELECT id, name, email, is_admin FROM users WHERE id = $1',
      [userId]
    )

    if (user.rows.length === 0) {
      return res.status(200).json({ user: null })
    }

    //  Return user (NO password)
    res.status(200).json({ user: user.rows[0] })

  } catch (error) {
    // expired/invalid token is also a normal "not logged in" outcome
    res.status(200).json({ user: null })
  }
})


export default router