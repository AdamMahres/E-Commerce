import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";


export const CartContext = createContext()

export const useCartContext = () => useContext(CartContext)

export const CartProvider = ({children}) => { 
    const [cartItems, setCartItems] = useState([])

    const isAddedToCart = (id) => {
        return cartItems.some(cartItem => cartItem.id === id)
    }

    const addToCart =  async (item) => { 
        try {
            if(!isAddedToCart(item.id)){
                setCartItems(prev => [...prev,item])
                const response = await fetch('http://localhost:5000/cart/item', {
                    method:'POST',
                    credentials:'include',
                    headers:{
                         "Content-Type":"application/json",
                    },
                    body: JSON.stringify(item)
                })
        }
            
        } catch (error) {
            console.error(error.message)
        }
        
        
    }

    const removeFromCart = (id) => { 
        const filteredItems = cartItems.filter(element => {
            return element.id !== id
        })

        setCartItems(filteredItems)
    }

const value = {
    isAddedToCart,
    cartItems,
    addToCart,
    removeFromCart
}

return <CartContext.Provider value={value}>
    {children}
</CartContext.Provider>

}

