"use client"

import { useState, useEffect, useCallback } from "react"

interface Transaction {
  id: string
  type: "credit" | "debit"
  amount: number
  description: string
  jobId: string
  createdAt: string
}

interface Wallet {
  id: string
  userId: string
  balance: number
  transactions: Transaction[]
}

export function useWallet(userId: string) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")  

  const fetchWallet = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/wallet/${userId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) throw new Error('Erro ao carregar carteira')

      const data = await response.json()
      setBalance(Number(data.balance))
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('Erro ao carregar carteira:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar carteira')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateBalance = async (amount: number): Promise<boolean> => {
    if (!userId) return false

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/wallet/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ amount })
      })

      if (!response.ok) throw new Error('Erro ao atualizar saldo')

      const data = await response.json()
      setBalance(Number(data.balance))
      setLastUpdated(new Date().toLocaleTimeString())
      return true
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar saldo')
      return false
    } finally {
      setLoading(false)
    }
  }

  const hasEnoughBalance = async (amount: number): Promise<boolean> => {
    await fetchWallet() // Recarrega saldo antes de verificar
    return balance >= amount
  }

  useEffect(() => {
    // Busca inicial
    fetchWallet()

    // Polling a cada 10 segundos
    const interval = setInterval(() => {
      fetchWallet()
    }, 10000)

    // Limpa intervalo quando componente é desmontado
    return () => clearInterval(interval)
  }, [fetchWallet])

  return {
    balance,
    loading,
    error,
    lastUpdated,
    updateBalance,
    hasEnoughBalance,
    reloadBalance: fetchWallet
  }
}
