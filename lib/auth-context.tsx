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

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id" | "wallet" | "createdAt">) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  updateWallet: (userId: string, amount: number) => void
  getUserById: (userId: string) => User | undefined
  getAllUsers: () => User[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default users
const defaultUsers: User[] = [
  {
    id: "admin-1",
    name: "Administrador",
    email: "admin@admin.com",
    role: "admin",
    wallet: 10000,
    createdAt: new Date().toISOString(),
    avatar: "/placeholder.svg",
    bio: "Administrador da plataforma",
  },
  {
    id: "company-1",
    name: "TechCorp Soluções",
    email: "contato@techcorp.com",
    role: "company",
    wallet: 5000,
    createdAt: new Date().toISOString(),
    avatar: "/placeholder.svg",
    document: "12.345.678/0001-90",
    phone: "(11) 99999-9999",
    bio: "Empresa de tecnologia especializada em soluções digitais",
  },
  {
    id: "worker-1",
    name: "João Silva",
    email: "joao.silva@email.com",
    role: "worker",
    wallet: 1500,
    createdAt: new Date().toISOString(),
    avatar: "/placeholder.svg",
    document: "123.456.789-00",
    phone: "(11) 88888-8888",
    bio: "Desenvolvedor Full Stack com 5 anos de experiência",
    category: "desenvolvimento",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(defaultUsers)
  const [isLoading, setIsLoading] = useState(true)

  // Inicializa o estado de autenticação
  useEffect(() => {
    try {
      // Carrega usuários salvos ou usa os padrões
      const savedUsers = localStorage.getItem("users")
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers))
      } else {
        localStorage.setItem("users", JSON.stringify(defaultUsers))
      }

      // Tenta restaurar usuário logado do cookie
      const savedUser = document.cookie.split("; ").find(row => row.startsWith("user="))
      if (savedUser) {
        const userData = JSON.parse(decodeURIComponent(savedUser.split("=")[1]))
        const foundUser = users.find(u => u.id === userData.id)
        if (foundUser) {
          setUser(foundUser)
        }
      }
    } catch (error) {
      console.error("Erro ao restaurar estado:", error)
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      localStorage.clear()
    }

    setIsLoading(false)
  }, [])

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = users.find((u) => u.email === email)

    if (foundUser) {
      const validPasswords: Record<string, string> = {
        "admin@admin.com": "123456",
        "contato@techcorp.com": "tech123",
        "joao.silva@email.com": "joao123",
      }

      if (validPasswords[email] === password) {
        setUser(foundUser)
        // Salva no cookie com expiração de 7 dias
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 7)
        document.cookie = `user=${JSON.stringify({ id: foundUser.id })}; expires=${expirationDate.toUTCString()}; path=/`
        return true
      }
    }

    return false
  }

  const register = async (userData: Omit<User, "id" | "wallet" | "createdAt">): Promise<boolean> => {
    if (users.find((u) => u.email === userData.email)) {
      return false
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      wallet: 0,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, newUser]
    saveUsers(updatedUsers)
    return true
  }

  const logout = () => {
    setUser(null)
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
  }

  const updateProfile = (data: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...data }
    setUser(updatedUser)

    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u))
    saveUsers(updatedUsers)

    // Atualiza o cookie
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)
    document.cookie = `user=${JSON.stringify({ id: updatedUser.id })}; expires=${expirationDate.toUTCString()}; path=/`
  }

  const updateWallet = (userId: string, amount: number) => {
    if (users.find((u) => u.id === userId)?.role === "admin") {
      return
    }

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, wallet: Math.max(0, u.wallet + amount) } : u))
    saveUsers(updatedUsers)

    if (user && user.id === userId) {
      setUser({ ...user, wallet: Math.max(0, user.wallet + amount) })
    }
  }

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId)
  }

  const getAllUsers = () => {
    return users
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
