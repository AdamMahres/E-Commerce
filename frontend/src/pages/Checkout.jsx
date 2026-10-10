import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartContext } from '../contexts/CartContext'
import { useUserContext } from '../contexts/UserContext'
import { checkout } from '../services/api'

function Checkout() {
  const navigate = useNavigate()
  const { user, loading } = useUserContext()
  const { cartItems, isLoading: isCartLoading, error: cartError } = useCartContext()

  const [form, setForm] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  if (!user) {
    return null
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const data = await checkout(form)
      window.location.href = data.url
    } catch (error) {
      setError(error.message)
      setIsSubmitting(false)
    }
  }

  if (isCartLoading) {
    return <div className='p-6'>Loading ...</div>
  }

  if (cartError) {
    return <div className='p-6'>Something went wrong loading your cart.</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <h2 className='font-poppins'>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="bg-black text-white px-4 py-3 rounded-2xl m-4 hover:text-gray-300 transition hover:bg-gray-800">Shope Now</button>
      </div>
    )
  }

  return (
    <div className='p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-10'>
      <form className='md:w-1/2 space-y-4' onSubmit={handleSubmit}>
        <h2 className='text-2xl font-bold mb-4'>Shipping Information</h2>

        <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
        <input name="addressLine1" placeholder="Address Line 1" value={form.addressLine1} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
        <input name="addressLine2" placeholder="Address Line 2 (optional)" value={form.addressLine2} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
        <input name="state" placeholder="State / Region (optional)" value={form.state} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
        <input name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
        <input name="country" placeholder="Country" value={form.country} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
        <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />

        {error && <p className='text-red-600'>{error}</p>}

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50">
          {isSubmitting ? 'Redirecting to payment...' : 'Pay with Stripe'}
        </button>
      </form>

      <div className='md:w-1/2'>
        <h2 className='text-2xl font-bold mb-4'>Order Summary</h2>
        <div className='bg-white rounded-lg shadow-lg p-4 space-y-3'>
          {cartItems.map(item => (
            <div key={item.id} className='flex justify-between gap-3'>
              <span className='flex-1 min-w-0'>{item.title} × {item.quantity}</span>
              <span className='shrink-0'>{(Number(item.price) * item.quantity).toFixed(2)} DHS</span>
            </div>
          ))}
          <div className='border-t pt-3 flex justify-between font-semibold'>
            <span>Total</span>
            <span>{total.toFixed(2)} DHS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
