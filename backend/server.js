import 'dotenv/config'
import express from "express";
import AuthRouter from "./routes/auth.js";
import cartRouter from './routes/cart.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import adminRouter from './routes/admin.js'
import cookieParser from "cookie-parser";
import cors from 'cors'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    credentials:true,
    origin:'http://localhost:5173'
}))

app.use('/auth', AuthRouter)
app.use('/cart',cartRouter)
app.use('/products', productsRouter)
app.use('/orders', ordersRouter)
app.use('/admin', adminRouter)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})
