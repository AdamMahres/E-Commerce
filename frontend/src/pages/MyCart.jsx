import React from 'react'
import { useCartContext } from '../contexts/CartContext'
import { useNavigate } from 'react-router-dom'
import CartItem from '../components/CartItem'


function MyCart() {
    const {cartItems, isLoading, error} = useCartContext()
    const navigate = useNavigate()

    if(isLoading){
        return <div className='p-6'>Loading ...</div>
    }

    if(error){
        return <div className='p-6'>Something went wrong loading your cart.</div>
    }

    if(cartItems.length > 0){
        const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
        return (
            <div className='p-4 sm:p-6 max-w-2xl mx-auto'>
                {cartItems.map(item => (
                     <CartItem product={item} key={item.id}/>
                ))}
                <div className='flex flex-col sm:flex-row sm:justify-between items-center gap-3 bg-white p-4 rounded-lg shadow-lg'>
                    <span className='text-xl font-semibold'>Total: {total.toFixed(2)} DHS</span>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        )
    }

    return (
      <div className='flex flex-col justify-center items-center h-screen'>
          <h2 className='font-poppins'>No items added to your cart</h2>
          <p className='font-poppins'>Start adding items to your cart</p>
          <button onClick={() => { navigate('/')}} className="bg-black text-white px-4 py-3 rounded-2xl m-4 hover:text-gray-300 transition hover:bg-gray-800">Shope Now</button>
      </div>
    )
}

export default MyCart