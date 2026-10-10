import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserContext } from '../../contexts/UserContext'
import { adminGetOrders } from '../../services/api'

function AdminOrders() {
  const navigate = useNavigate()
  const { user, loading } = useUserContext()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      navigate('/')
    }
  }, [loading, user, navigate])

  useEffect(() => {
    if (!user || !user.is_admin) return
    const loadOrders = async () => {
      setIsLoading(true)
      setError(false)
      try {
        const data = await adminGetOrders()
        setOrders(data)
      } catch (error) {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [user])

  if (!user || !user.is_admin) {
    return null
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='flex gap-4 mb-6'>
        <Link to='/admin/products' className='text-gray-500 hover:text-black'>Products</Link>
        <Link to='/admin/orders' className='font-semibold'>Orders</Link>
      </div>

      <h2 className='text-2xl font-bold mb-6'>Admin · Orders</h2>

      {isLoading && <div>Loading ...</div>}
      {error && <div>Something went wrong loading orders.</div>}
      {!isLoading && !error && orders.length === 0 && <p className='text-gray-500'>No orders yet.</p>}

      <div className='space-y-4'>
        {orders.map(order => (
          <div key={order.id} className='bg-white rounded-lg shadow-lg p-4'>
            <div className='flex justify-between'>
              <span className='font-semibold'>Order #{order.id}</span>
              <span className={order.status === 'paid' ? 'text-green-700' : 'text-amber-700'}>{order.status}</span>
            </div>
            <div className='text-gray-500 text-sm mt-1'>{order.customer_name} · {order.customer_email}</div>
            <div className='text-gray-500 text-sm'>{new Date(order.created_at).toLocaleString()}</div>

            <div className='mt-3 space-y-1'>
              {order.items.map((item, index) => (
                <div key={index} className='flex justify-between gap-3 text-sm'>
                  <span className='flex-1 min-w-0'>{item.product_title} × {item.quantity}</span>
                  <span className='shrink-0'>{(Number(item.unit_price) * item.quantity).toFixed(2)} DHS</span>
                </div>
              ))}
            </div>

            <div className='border-t mt-3 pt-3 flex justify-between font-semibold'>
              <span>Total</span>
              <span>{Number(order.total_amount).toFixed(2)} DHS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminOrders
