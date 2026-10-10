
import NavBar from './components/NavBar'
import Home from './pages/Home'
import {Routes,Route} from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import { CartProvider } from './contexts/CartContext'
import MyCart from './pages/MyCart'
import { UserProvider } from './contexts/UserContext'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Profile from './pages/Profile'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'



function App() {

   return (
    <UserProvider>

    <CartProvider>
      <NavBar/>
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/signup' element={<SignUp/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/myCart' element={<MyCart/>}></Route>
      <Route path='/products/:id' element={<ProductDetail/>}></Route>
      <Route path='/checkout' element={<Checkout/>}></Route>
      <Route path='/order-confirmation/:id' element={<OrderConfirmation/>}></Route>
      <Route path='/profile' element={<Profile/>}></Route>
      <Route path='/admin/products' element={<AdminProducts/>}></Route>
      <Route path='/admin/orders' element={<AdminOrders/>}></Route>
    </Routes>
    </CartProvider>
    </UserProvider>
    
    
  )
}



export default App
