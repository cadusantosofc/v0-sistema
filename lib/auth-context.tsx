"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "company" | "worker"
  avatar?: string
  document?: string
  phone?: string
  bio?: string
  category?: string
  wallet: number
  createdAt: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id" | "wallet" | "createdAt">) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  updateWallet: (newBalance: number) => void
  getUserById: (userId: string) => Promise<User | undefined>
  getAllUsers: () => Promise<User[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Inicializa o estado de autenticação
  useEffect(() => {
    async function restoreUser() {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Se a resposta não for OK, verificamos se existe um cookie de usuário
          const userCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('user='))
            
          if (userCookie) {
            try {
              // Se existe o cookie, tentamos fazer uma nova requisição
              const userId = JSON.parse(userCookie.split('=')[1]).id
              if (userId) {
                const userResponse = await fetch(`/api/users/${userId}`)
                if (userResponse.ok) {
                  const userData = await userResponse.json()
                  setUser(userData.user)
                }
              }
            } catch (cookieError) {
              console.error("Erro ao processar cookie:", cookieError)
            }
          }
        }
      } catch (error) {
        console.error("Erro ao restaurar estado:", error)
        // Não apagamos o cookie aqui para evitar logout automático
      }

      setIsLoading(false)
    }

    restoreUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('Resposta do login:', { ok: response.ok, data })

      if (response.ok && data.user) {
        setUser(data.user)
        // Salva no cookie com expiração de 30 dias
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 30)
        document.cookie = `user=${JSON.stringify({ id: data.user.id })}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    }
  }

  const register = async (userData: Omit<User, "id" | "wallet" | "createdAt">): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok && data.user) {
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao registrar:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const { user: updatedUser } = await response.json()
        setUser(updatedUser)

        // Atualiza o cookie com expiração de 30 dias
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 30)
        document.cookie = `user=${JSON.stringify({ id: updatedUser.id })}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
    }
  }

  const updateWallet = async (newBalance: number) => {
    if (!user) return;
    
    try {
      // Atualiza o estado do usuário localmente com o novo saldo
      setUser({ ...user, wallet: newBalance });
      
      console.log(`Carteira atualizada localmente: novo saldo = ${newBalance}`);
      
      // Não é necessário fazer uma chamada API aqui, pois o saldo já foi atualizado no servidor
      // pelo endpoint de reembolso ou outro processo
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error);
    }
  }

  const getUserById = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        return data.user
      }
      return undefined
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      return undefined
    }
  }

  const getAllUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        return data.users
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return []
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateWallet,
        getUserById,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
