"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react"

interface WalletContextData {
  balance: number
  loading: boolean
  error: string | null
  updateBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData)

interface WalletProviderProps {
  userId: string
  children: ReactNode
}

export function WalletProvider({ userId, children }: WalletProviderProps) {
  const [data, setData] = useState<Omit<WalletContextData, "updateBalance">>({
    balance: 0,
    loading: true,
    error: null
  })

  const updateBalance = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      const res = await fetch(`/api/wallet/${userId}`)
      if (!res.ok) throw new Error("Erro ao buscar saldo")
      
      const data = await res.json()
      setData(prev => ({
        ...prev,
        balance: data.balance,
        error: null
      }))
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: "Erro ao buscar saldo"
      }))
    } finally {
      setData(prev => ({
        ...prev,
        loading: false
      }))
    }
  }

  // Busca saldo inicial
  useEffect(() => {
    if (userId) {
      updateBalance()
    }
  }, [userId])

  // Atualiza saldo a cada 5 segundos
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(updateBalance, 5000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <WalletContext.Provider
      value={{
        ...data,
        updateBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => useContext(WalletContext)
