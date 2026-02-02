import {jwtDecode} from 'jwt-decode'
import axiosClient from '../lib/axios.ts'
import { storage } from '../lib/storage.ts'
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken)
        setUser(decoded)
        setToken(storedToken)
      } catch {
        localStorage.removeItem('access_token')
      }
    }

    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const res = await axiosClient.post('/api/auth/login', credentials)

    const accessToken = res.data.accessToken
    localStorage.setItem('access_token', accessToken)

    setToken(accessToken)
    setUser(jwtDecode(accessToken))
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    setToken(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


