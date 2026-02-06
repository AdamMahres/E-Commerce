import { useEffect, useState } from 'react'
import { getProducts } from '../services/api'
import Item from '../components/Item'



function Home() {
   const [error, setError] = useState(false)
   const [products,setProducts] = useState([])
   const [isloading, setIsLoading] = useState(true)


  useEffect(() => { 
    const loadProducts = async () => {
      try {
        const data = await getProducts()
        
        setProducts(data.map(item =>(
          {...item, isAddedToCart:false}
        )))
      } catch (error) {
        setError(true)
      }finally{
        setIsLoading(false)
      }
    }
    loadProducts()
   },[])

 

   return (
    
    <div className='grid grid-cols-4 gap-6 p-6 '>

        {isloading && <div> Loading ...</div>}
        {error && <div> Error</div>}
        {products.map(product => {
          console.log(product.isAddedToCart)
          return <Item key={product.id} product={product}/>
          
        })}

   </div>
    
    )   
  
}

export default Home