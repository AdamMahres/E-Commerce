import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
function SignUp() {
   const navigate = useNavigate();
   const { setUser } = useUserContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if(!name.trim()){
      setError('please enter your name')
      return
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setError('please enter a valid email address')
      return
    }
    if(password.length < 6){
      setError('password must be at least 6 characters')
      return
    }
    if(password !== confirmPassword){
      setError('your password is wrong')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("http://localhost:5000/auth/signup",{
        method:'POST',
        headers:{
          "Content-Type":"application/json",
        },
        credentials:'include',
        body:JSON.stringify({name,email,password})
      })
      const data = await response.json()
      if(!response.ok){
        setError(data.message)
      }else{
        setUser(data)
        navigate("/")
      }

    } catch (error) {
      setError('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        
        
        <h2 className="text-2xl font-bold text-center mb-6">
          Create an Account
        </h2>

      
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>  setName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />

          {error && <p className='text-red-600'>{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

      
        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account?{" "}
          <Link to="/login"className="text-black font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
