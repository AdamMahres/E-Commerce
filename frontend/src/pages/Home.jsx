import { useEffect, useState } from 'react'
import { getProducts, getCategories } from '../services/api'
import Item from '../components/Item'
import { useUserContext } from '../contexts/UserContext'


function Home() {
   const [error, setError] = useState(false)
   const [products,setProducts] = useState([])
   const [isloading, setIsLoading] = useState(true)
   const [categories, setCategories] = useState([])
   const [search, setSearch] = useState('')
   const [category, setCategory] = useState('')
   const {user} = useUserContext()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error(error)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(false)
      try {
        const data = await getProducts({ search, category })
        setProducts(data)
      } catch (error) {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    // debounce so typing a search term doesn't fire a request per keystroke
    const timeoutId = setTimeout(loadProducts, 300)
    return () => clearTimeout(timeoutId)
   },[search, category])



   return (
    <div className='p-4 sm:p-6'>
        {user && <h2 className='text-2xl font-semibold mb-4'>Welcome {user.name}!</h2>}

        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {isloading && <div> Loading ...</div>}
        {error && <div> Error</div>}
        {!isloading && !error && products.length === 0 && <div>No products found</div>}
        {products.map(product => {
          return <Item key={product.id} product={product}/>
        })}

        </div>
    </div>


    )

}

export default Home
