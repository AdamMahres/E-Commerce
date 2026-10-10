import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartContext } from '../contexts/CartContext'
import { useUserContext } from '../contexts/UserContext'

function NavBar() {
  const { cartItems } = useCartContext()
  const { user, logout } = useUserContext()  // get the user
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = async () => {
    await logout()
    closeMenu()
    navigate('/')
  }

  return (
    <nav className="bg-black text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">

        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className='hover:text-gray-300 transition' onClick={closeMenu}>Home</Link>
          <Link to="/MyCart" className='hover:text-gray-300 transition' onClick={closeMenu}>
            MyCart ({cartCount})
          </Link>
        </div>

        <div className="hidden sm:flex space-x-6 items-center">
          {user ? (
            <>
              <span className="font-semibold">{user.name}</span>
              <Link to="/profile" className="hover:text-gray-300 transition">
                Profile
              </Link>
              {user.is_admin && (
                <Link to="/admin/products" className="hover:text-gray-300 transition">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="hover:text-gray-300 transition cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition">Login</Link>
              <Link to="/signup" className="hover:text-gray-300 transition">Sign Up</Link>
            </>
          )}
        </div>

        <button
          className="sm:hidden text-2xl leading-none px-2 cursor-pointer"
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden mt-4 flex flex-col gap-4 pb-1">
          {user ? (
            <>
              <span className="font-semibold">{user.name}</span>
              <Link to="/profile" className="hover:text-gray-300 transition" onClick={closeMenu}>
                Profile
              </Link>
              {user.is_admin && (
                <Link to="/admin/products" className="hover:text-gray-300 transition" onClick={closeMenu}>
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="text-left hover:text-gray-300 transition cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition" onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="hover:text-gray-300 transition" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default NavBar
