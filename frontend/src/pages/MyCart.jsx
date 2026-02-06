import React from 'react'
import { useCartContext } from '../contexts/CartContext'
import Item from '../components/Item'
import { useNavigate } from 'react-router-dom'


function MyCart() {
    const {cartItems, isAddedToCart} = useCartContext()
    const navigate = useNavigate()

    if(cartItems.length > 0){
        return (
            <div>
                {cartItems.map(item => (
                     isAddedToCart(item.id) && <Item key={item.id} product={item}/>
                ))}
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