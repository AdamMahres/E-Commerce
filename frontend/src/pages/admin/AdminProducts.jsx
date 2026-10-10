import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserContext } from '../../contexts/UserContext'
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../services/api'

const emptyForm = { title: '', price: '', image: '', description: '', category: '' }

function AdminProducts() {
  const navigate = useNavigate()
  const { user, loading } = useUserContext()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editingId, setEditingId] = useState(null) // null = closed, 'new' = creating, else product id being edited
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      navigate('/')
    }
  }, [loading, user, navigate])

  const loadProducts = async () => {
    setIsLoading(true)
    setError(false)
    try {
      const data = await adminGetProducts()
      setProducts(data)
    } catch (error) {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user || !user.is_admin) return
    loadProducts()
  }, [user])

  if (!user || !user.is_admin) {
    return null
  }

  const startCreate = () => {
    setForm(emptyForm)
    setFormError('')
    setEditingId('new')
  }

  const startEdit = (product) => {
    setForm({
      title: product.title,
      price: product.price,
      image: product.image,
      description: product.description || '',
      category: product.category || ''
    })
    setFormError('')
    setEditingId(product.id)
  }

  const cancelForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.title.trim()) {
      setFormError('title is required')
      return
    }
    if (!form.image.trim()) {
      setFormError('image URL is required')
      return
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setFormError('price must be a positive number')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingId === 'new') {
        await adminCreateProduct(form)
      } else {
        await adminUpdateProduct(editingId, form)
      }
      await loadProducts()
      cancelForm()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This can't be undone.`)) return
    try {
      await adminDeleteProduct(product.id)
      await loadProducts()
    } catch (error) {
      setError(true)
    }
  }

  return (
    <div className='p-4 sm:p-6 max-w-5xl mx-auto'>
      <div className='flex gap-4 mb-6'>
        <Link to='/admin/products' className='font-semibold'>Products</Link>
        <Link to='/admin/orders' className='text-gray-500 hover:text-black'>Orders</Link>
      </div>

      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6'>
        <h2 className='text-2xl font-bold'>Admin · Products</h2>
        {editingId === null && (
          <button onClick={startCreate} className='w-full sm:w-auto bg-black text-white px-4 py-2 rounded hover:bg-gray-800'>
            New Product
          </button>
        )}
      </div>

      {editingId !== null && (
        <form onSubmit={handleSubmit} className='bg-white rounded-lg shadow-lg p-4 mb-6 space-y-3'>
          <h3 className='font-semibold'>{editingId === 'new' ? 'New Product' : 'Edit Product'}</h3>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          <input name="price" placeholder="Price" value={form.price} onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          <input name="category" placeholder="Category (optional)" value={form.category} onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />
          <textarea name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black" />

          {formError && <p className='text-red-600'>{formError}</p>}

          <div className='flex gap-3'>
            <button type="submit" disabled={isSubmitting}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={cancelForm}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <div>Loading ...</div>}
      {error && <div>Something went wrong loading products.</div>}

      {!isLoading && !error && (
        <div className='bg-white rounded-lg shadow-lg overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b'>
                <th className='p-3'>Image</th>
                <th className='p-3'>Title</th>
                <th className='p-3'>Category</th>
                <th className='p-3'>Price</th>
                <th className='p-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className='border-b last:border-b-0'>
                  <td className='p-3'><img src={product.image} alt={product.title} className='w-12 h-12 object-contain' /></td>
                  <td className='p-3'>{product.title}</td>
                  <td className='p-3'>{product.category}</td>
                  <td className='p-3'>{product.price} DHS</td>
                  <td className='p-3 space-x-3'>
                    <button onClick={() => startEdit(product)} className='text-blue-600 hover:underline cursor-pointer'>Edit</button>
                    <button onClick={() => handleDelete(product)} className='text-red-600 hover:underline cursor-pointer'>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
