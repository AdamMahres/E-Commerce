import { useCartContext } from '../contexts/CartContext'

function CartItem({product}) {
    const { removeFromCart, updateQuantity } = useCartContext()

    const handleIncrement = () => {
        updateQuantity(product.id, product.quantity + 1)
    }
    const handleDecrement = () => {
        updateQuantity(product.id, product.quantity - 1)
    }
    const handleDeletion = () => {
        removeFromCart(product.id)
    }
  return (
    <div className='flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-lg mb-4'>
        <img className='h-28 w-28 sm:h-35 sm:w-25 object-contain shrink-0' src={product.image} alt={product.title} />
        <div className='flex flex-1 flex-col justify-center items-center sm:items-start text-center sm:text-left'>
            <p className='font-semibold text-gray-800'>{product.title}</p>
            <p className='text-gray-500'>{product.price} DHS</p>
            <p className='font-medium mt-1'>totale: {(product.price * product.quantity).toFixed(2)}</p>
        </div>
        <div className='flex justify-center items-center gap-x-4'>
            <button className='hover:bg-gray-500 border rounded bg-black text-white w-8 h-8 shrink-0' onClick={handleIncrement}>+</button>
            <p className='w-6 text-center'>{product.quantity}</p>
            <button className='hover:bg-gray-500 border rounded bg-black text-white w-8 h-8 shrink-0' onClick={handleDecrement}>-</button>
            <button className='bg-red-600 h-8 w-8 shrink-0 text-white border rounded hover:bg-red-400' onClick={handleDeletion}>X</button>
        </div>
    </div>
  )
}

export default CartItem
