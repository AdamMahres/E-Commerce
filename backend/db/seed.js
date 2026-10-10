import 'dotenv/config'
import pool from '../config/db.js'

const FAKESTORE_URL = 'https://fakestoreapi.com/products'

const seed = async () => {
    console.log(`Fetching products from ${FAKESTORE_URL} ...`)
    const response = await fetch(FAKESTORE_URL)
    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
    }
    const products = await response.json()

    for (const product of products) {
        await pool.query(
            `insert into products (api_product_id, title, price, image, description, category)
             values ($1, $2, $3, $4, $5, $6)
             on conflict (api_product_id) do update
             set title = excluded.title,
                 price = excluded.price,
                 image = excluded.image,
                 description = excluded.description,
                 category = excluded.category`,
            [product.id, product.title, product.price, product.image, product.description, product.category]
        )
    }

    console.log(`Seeded ${products.length} products.`)
    await pool.end()
}

seed().catch(error => {
    console.error('Seed failed:', error)
    process.exit(1)
})
