import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { confirmOrder, getOrder } from '../services/api'
import { useCartContext } from '../contexts/CartContext'

function OrderConfirmation() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCartContext()

  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(false)
      try {
        const data = sessionId
          ? await confirmOrder(id, sessionId)
          : await getOrder(id)
        setOrder(data.order)
        setItems(data.items)
        // The confirm endpoint already cleared the cart server-side when payment
        // succeeded. CartContext has no way to know that happened on its own
        // (its cart fetch is only triggered by `user` changing), so without this
        // the nav badge would keep showing the pre-checkout count until a reload.
        if (sessionId && data.order.status === 'paid') {
          clearCart()
        }
      } catch (error) {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, sessionId])

  if (isLoading) {
    return <div className='p-6'>Loading ...</div>
  }

  if (error || !order) {
    return <div className='p-6'>Order not found</div>
  }

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      {order.status === 'paid' ? (
        <h2 className='text-2xl font-bold text-green-700 mb-2'>Thank you! Your order is confirmed.</h2>
      ) : (
        <h2 className='text-2xl font-bold text-amber-700 mb-2'>Payment not completed</h2>
      )}
      <p className='text-gray-500 mb-6'>Order #{order.id} · {new Date(order.created_at).toLocaleString()}</p>

      <div className='bg-white rounded-lg shadow-lg p-4 space-y-3 mb-6'>
        {items.map(item => (
          <div key={item.id} className='flex justify-between gap-3'>
            <span className='flex-1 min-w-0'>{item.product_title} × {item.quantity}</span>
            <span className='shrink-0'>{(Number(item.unit_price) * item.quantity).toFixed(2)} DHS</span>
          </div>
        ))}
        <div className='border-t pt-3 flex justify-between font-semibold'>
          <span>Total</span>
          <span>{Number(order.total_amount).toFixed(2)} DHS</span>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-lg p-4 mb-6'>
        <h3 className='font-semibold mb-2'>Shipping to</h3>
        <p>{order.full_name}</p>
        <p>{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p>
        <p>{order.city}{order.state ? `, ${order.state}` : ''} {order.postal_code}</p>
        <p>{order.country}</p>
      </div>

      <Link to="/" className='text-black font-semibold hover:underline'>Continue shopping</Link>
    </div>
  )
}

export default OrderConfirmation
