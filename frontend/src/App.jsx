
import NavBar from './components/NavBar'
import Home from './pages/Home'
import {Routes,Route} from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import { CartProvider } from './contexts/CartContext'
import MyCart from './pages/MyCart'



function App() {

   return (
    <CartProvider>
      <NavBar/>
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/signup' element={<SignUp/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/myCart' element={<MyCart/>}></Route>
    </Routes>
    </CartProvider>
    
    
  )
}



export default App
