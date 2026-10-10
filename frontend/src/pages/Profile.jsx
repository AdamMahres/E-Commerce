import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserContext } from '../contexts/UserContext'
import { getOrders } from '../services/api'

function Profile() {
  const navigate = useNavigate()
  const { user, loading } = useUserContext()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user) return
    const loadOrders = async () => {
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (error) {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  if (!user) {
    return null
  }

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      {user && <h2 className='text-2xl font-bold mb-1'>{user.name}</h2>}
      {user && <p className='text-gray-500 mb-6'>{user.email}</p>}

      <h3 className='text-xl font-semibold mb-4'>Order History</h3>

      {isLoading && <div>Loading ...</div>}
      {error && <div>Something went wrong loading your orders.</div>}

      {!isLoading && !error && orders.length === 0 && (
        <p className='text-gray-500'>You haven't placed any orders yet.</p>
      )}

      <div className='space-y-3'>
        {orders.map(order => (
          <Link
            to={`/order-confirmation/${order.id}`}
            key={order.id}
            className='block bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition'
          >
            <div className='flex justify-between'>
              <span className='font-semibold'>Order #{order.id}</span>
              <span className={order.status === 'paid' ? 'text-green-700' : 'text-amber-700'}>
                {order.status}
              </span>
            </div>
            <div className='flex justify-between gap-3 text-gray-500 mt-1'>
              <span className='flex-1 min-w-0'>{new Date(order.created_at).toLocaleDateString()} · {order.item_count} item(s)</span>
              <span className='shrink-0'>{Number(order.total_amount).toFixed(2)} DHS</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Profile
