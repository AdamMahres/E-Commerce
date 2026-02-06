import { useCartContext } from "../contexts/CartContext"


function Item({product}) {
  const {addToCart} = useCartContext()
  const handleClick = () => { 
    addToCart(product)
   }
  return (
    <div className="flex flex-col bg-white p-4 shadow-lg rounded-lg h-full">
        <div className="flex-1 flex flex-col items-center">
        <img src={product.image} 
        alt={product.title}
        className="w-36 h-34 object-contain" />
        
        <p className="mt-2 text-center font-semibold">{product.title}</p>
        <p className="mt-1 text-center text-gray-500">{product.price} DHS</p>
        </div>
        
        <button onClick={handleClick} className="mt-3 bg-black text-white px-8 py-2 rounded hover:bg-gray-800">Add To Cart</button>
    
    </div>
  )
}

export default Item