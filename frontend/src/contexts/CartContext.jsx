import { useState, useContext, createContext, useEffect } from "react";
import { useUserContext } from "./UserContext";

export const CartContext = createContext()

export const useCartContext = () => useContext(CartContext)

export const CartProvider = ({children}) => {
    const { user } = useUserContext()
    const [cartItems, setCartItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const loadCart = async () => {
            if (!user) {
                setCartItems([])
                setIsLoading(false)
                return
            }
            setIsLoading(true)
            setError(false)
            try {
                const response = await fetch('http://localhost:5000/cart', {
                    credentials: 'include'
                })
                const data = await response.json()
                setCartItems(data.cartItems || [])
            } catch (error) {
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        loadCart()
    }, [user])

    const isAddedToCart = (id) => {
        return cartItems.some(cartItem => cartItem.id === id)
    }

    const addToCart = async (item) => {
        if (!user) return
        try {
            if (!isAddedToCart(item.id)) {
                setCartItems(prev => [...prev, { ...item, quantity: 1 }])
            } else {
                setCartItems(prev => prev.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                ))
            }

            const response = await fetch('http://localhost:5000/cart/item', {
                method:'POST',
                credentials:'include',
                headers:{
                     "Content-Type":"application/json",
                },
                body: JSON.stringify(item)
            })
            const data = await response.json()
            if (response.ok) {
                setCartItems(prev => prev.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: data.quantity } : cartItem
                ))
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) {
            return removeFromCart(id)
        }

        setCartItems(prev => prev.map(cartItem =>
            cartItem.id === id ? { ...cartItem, quantity } : cartItem
        ))

        try {
            await fetch(`http://localhost:5000/cart/item/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quantity })
            })
        } catch (error) {
            console.error(error.message)
        }
    }

    const removeFromCart = async (id) => {
        const filteredItems = cartItems.filter(element => {
            return element.id !== id
        })

        setCartItems(filteredItems)

        try {
            await fetch(`http://localhost:5000/cart/item/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
        } catch (error) {
            console.error(error.message)
        }
    }

    // For syncing local state after something else (e.g. order confirmation)
    // already cleared the cart server-side, so the badge doesn't show stale
    // counts until the next full reload.
    const clearCart = () => {
        setCartItems([])
    }

const value = {
    isAddedToCart,
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
    error
}

return <CartContext.Provider value={value}>
    {children}
</CartContext.Provider>

}
