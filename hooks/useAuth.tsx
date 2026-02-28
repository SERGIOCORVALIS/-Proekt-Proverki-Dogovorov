'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Проверяем, что мы на клиенте
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }
      
      const token = localStorage.getItem('token')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await api.get('/auth/me')
        setUser(response.data)
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token } = response.data
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token)
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      const userResponse = await api.get('/auth/me')
      setUser(userResponse.data)
      
      toast.success('Успешный вход в систему')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка входа в систему')
      throw error
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      await api.post('/auth/register', { email, password, full_name: fullName })
      toast.success('Регистрация успешна. Теперь войдите в систему.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка регистрации')
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    router.push('/')
    toast.success('Вы вышли из системы')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
