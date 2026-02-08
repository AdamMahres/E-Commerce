import express from "express";
import pool from "../config/db";

const router = express.Router()


router.get('/', (req, res) => { 
    
})

router.post("/item", async (req, res) => {
    try {
        const {id, title , price, image} = req.body
    
    if([id, title, price, image].some(element => !element)){
        return res.status(400).json({message: "missing required fields"})
    }
    
    const productExists = await pool.query("select * from products where api_product_id=$1",[id])
    let product
    if(productExists.rows.length === 0){
        const inserResult = await pool.query('insert into products (api_product_id, title, price, image) values($1, $2, $3, $4) returning * ;',[id, title, price, image])
        product = inserResult.rows[0]
    }else{
        product = productExists.rows[0]
    }

    return res.status(200).json({product})

    } catch (error) {
        console.error(err)
        return res.status(400).json({message:"something went wrong"})
    } 
    
})


export default router


