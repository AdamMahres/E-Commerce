import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProduct } from '../services/api'
import { useCartContext } from '../contexts/CartContext'
import { useUserContext } from '../contexts/UserContext'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartContext()
  const { user } = useUserContext()

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      setError(false)
      try {
        const data = await getProduct(id)
        setProduct(data)
      } catch (error) {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    addToCart(product)
  }

  if (isLoading) {
    return <div className='p-6'>Loading ...</div>
  }

  if (error || !product) {
    return <div className='p-6'>Product not found</div>
  }

  return (
    <div className='p-6 flex flex-col md:flex-row gap-10 max-w-4xl mx-auto'>
      <div className='flex justify-center items-center md:w-1/2'>
        <img src={product.image} alt={product.title} className='w-64 h-64 object-contain' />
      </div>
      <div className='md:w-1/2 flex flex-col'>
        <h2 className='text-2xl font-semibold'>{product.title}</h2>
        <p className='text-xl text-gray-600 mt-2'>{product.price} DHS</p>
        <p className='text-gray-500 mt-4'>{product.description}</p>
        <button
          onClick={handleAddToCart}
          className='mt-6 bg-black text-white px-8 py-3 rounded hover:bg-gray-800 self-start'
        >
          Add To Cart
        </button>
      </div>
    </div>
  )
}

export default ProductDetail
