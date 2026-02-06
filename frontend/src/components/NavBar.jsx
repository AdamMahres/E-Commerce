import { Link } from 'react-router-dom'
import { useCartContext } from '../contexts/CartContext'

function NavBar() {
  const {cartItems} = useCartContext()
  const n = cartItems.length
  return (
    <nav className="bg-black text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
            
            <div className="space-x-6">
            <Link to="/" className='hover:text-gray-300 transition'>Home</Link>
            <Link to='MyCart' className='hover:text-gray-300 transition'>MyCart {n}</Link> 
            </div>
       
            <div className="space-x-6">
                <Link to="/login" className="hover:text-gray-300 transition">
                Login
                </Link>
                <Link to="/signup"className=" text-withe px-4 py-1 rounded hover:text-gray-300 transition">
                  Sign Up
                </Link>
                
            </div>
        </div>
    </nav>
  )
}

export default NavBar