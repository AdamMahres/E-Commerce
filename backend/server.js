import express from "express";
import AuthRouter from "./routes/auth.js";
import cartRouter from './routes/cart.js'
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    credentials:true,
    origin:'http://localhost:5173'
}))

app.use('/auth', AuthRouter)
app.use('/cart',cartRouter)

app.listen(5000, () => { 
    console.log('server is running')
})
