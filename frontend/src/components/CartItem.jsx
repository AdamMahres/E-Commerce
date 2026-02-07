import React from 'react'
import { useState } from 'react'
import { useCartContext } from '../contexts/CartContext'

function CartItem({product}) {
    const { removeFromCart} = useCartContext()
    const [count, setCount] = useState(1)
    const handleDecrementCount = () => { 
        if(count > 0){
            setCount(count - 1)
        }
     }
    const handleDeletion = () => { 
        removeFromCart(product.id)
     }
  return (
    <div className='flex justify-between bg-white p-4 rounded-lg shadow-lg mb-4 '>
        <img className='h-35 w-25 object-contain' src={product.image} alt={product.title} />
        <div className='flex flex-1 flex-col justify-center items-center'>
            <p className='font-semibold text-gray-800'>{product.title}</p>
            <p className='text-gray-500'>{product.price} DHS</p>
            <p className='font-medium mt-1'>totale: {product.price * count}</p>
        </div>
        <div className='flex justify-center items-center gap-x-5'>
            <button className='hover:bg-gray-500 border rounded bg-black  text-white w-8 h-8 ' onClick={() => { setCount(count + 1) }}>+</button>
            <p className='w-6 text-center'>{count}</p>
            <button className=' hover:bg-gray-500 border rounded bg-black  text-white w-8 h-8' onClick={ handleDecrementCount }>-</button>

        </div>
        
        <button className='mx-7 bg-red-600 h-8 w-8 mt-13 text-white border rounded hover:bg-red-400' onClick={handleDeletion}>X</button>
    </div>
  )
}

export default CartItem