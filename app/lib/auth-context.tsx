"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "worker" | "company"
  bio?: string
  avatar?: string
  wallet?: number // Saldo do usuário
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
  updateProfile: (userData: any) => Promise<boolean>
  getUserById: (userId: string) => Promise<any>
  wallet: Wallet | null
  updateWallet: (newBalance: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me")
        if (response.status === 200) {
          setUser(response.data.user)
          setWallet(response.data.wallet || null)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setUser(null)
        setWallet(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      if (response.status === 200) {
        setUser(response.data.user)
        setWallet(response.data.wallet || null)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return false
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout")
      setUser(null)
      setWallet(null)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  // Função de registro
  const register = async (userData: any) => {
    try {
      const response = await axios.post("/api/auth/register", userData)
      if (response.status === 200) {
        setUser(response.data.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao registrar:", error)
      return false
    }
  }

  // Função para atualizar perfil
  const updateProfile = async (userData: any) => {
    if (!user) return false

    try {
      const response = await axios.patch(`/api/users/${user.id}`, userData)
      if (response.status === 200) {
        setUser({ ...user, ...response.data.user })
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      return false
    }
  }

  // Função para buscar usuário por ID
  const getUserById = async (userId: string) => {
    if (!userId) {
      console.error("ID de usuário inválido:", userId);
      return null;
    }
    
    try {
      console.log("Buscando usuário por ID:", userId);
      
      // Tenta buscar o usuário com até 3 tentativas
      let attempts = 0;
      const maxAttempts = 3;
      let error = null;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          const response = await axios.get(`/api/users/${userId}`);
          
          if (response.status === 200) {
            console.log("Usuário encontrado:", response.data?.name || userId);
            return response.data;
          }
          
          console.log(`Tentativa ${attempts}/${maxAttempts} falhou (status ${response.status})`);
        } catch (err) {
          error = err;
          console.error(`Tentativa ${attempts}/${maxAttempts} falhou com erro:`, err);
          // Aguarda antes de tentar novamente (exponential backoff)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, attempts * 500));
          }
        }
      }
      
      console.error("Todas as tentativas falharam para buscar usuário:", userId);
      
      // Se for uma empresa, gera um objeto de empresa padrão
      if (userId.startsWith('company-')) {
        const defaultCompany = {
          id: userId,
          name: `Empresa ${userId.split('-')[1] || ''}`,
          email: '',
          role: 'company',
          avatar: '/placeholder.svg',
          bio: 'Informações da empresa não disponíveis'
        };
        
        console.log("Retornando empresa padrão:", defaultCompany.name);
        return defaultCompany;
      }
      
      throw error || new Error(`Não foi possível encontrar o usuário com ID ${userId}`);
    } catch (error) {
      console.error("Erro final ao buscar usuário por ID:", error);
      return null;
    }
  };

  // Função para atualizar o saldo da carteira
  const updateWallet = (newBalance: number) => {
    if (wallet) {
      setWallet({ ...wallet, balance: newBalance })
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    getUserById,
    wallet,
    updateWallet,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
} 