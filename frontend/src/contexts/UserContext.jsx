import React, { useContext } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { createContext } from 'react'

const UserContext = createContext()
export const useUserContext = () => useContext(UserContext)

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading , setLoading] = useState(true)

    useEffect(() => { 
        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/current-user',{
                    method:'GET',
                    credentials:'include'
                })
                const data = await response.json()
                setUser(data.user)
            } catch (error) {
                console.error(error)
                
            }finally{
                setLoading(false)
            }
            
        }
        fetchUser()
     },[])

    const logout = async () => {
        try {
            await fetch('http://localhost:5000/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
        } finally {
            setUser(null)
        }
    }

    const value = {
        user,
        setUser,
        loading,
        logout
     }
     return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

