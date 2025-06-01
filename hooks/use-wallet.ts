"use client"

import { useState, useEffect } from "react"

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
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/wallet?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error("Erro ao carregar carteira")
      }
      
      const data = await response.json()
      setWallet(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      console.error("Erro ao carregar carteira:", err)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (
    type: "credit" | "debit",
    amount: number,
    description: string,
    jobId: string
  ) => {
    try {
      setError(null)
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          type,
          amount,
          description,
          jobId,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao adicionar transação")
      }

      // Recarrega a carteira para obter o novo saldo e transações
      await fetchWallet()
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      console.error("Erro ao adicionar transação:", err)
      return false
    }
  }

  useEffect(() => {
    if (userId) {
      fetchWallet()
    }
  }, [userId])

  return {
    wallet,
    loading,
    error,
    addTransaction,
    refetch: fetchWallet,
  }
}
