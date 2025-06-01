"use client"

import { useState, useEffect } from 'react'

interface WalletData {
  id: string
  name: string
  type: 'company' | 'worker'
  balance: number
}

export function useWallet(userId: string) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carrega o saldo inicial
  useEffect(() => {
    if (!userId) return
    loadBalance()
  }, [userId])

  // Função para carregar saldo
  const loadBalance = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/wallet/${userId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!res.ok) {
        throw new Error('Erro ao carregar saldo')
      }

      const data = await res.json()
      setBalance(data.balance)
    } catch (err) {
      console.error('Erro ao carregar saldo:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar saldo')
    } finally {
      setLoading(false)
    }
  }

  // Função para atualizar saldo
  const updateBalance = async (amount: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/wallet/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ amount })
      })

      if (!res.ok) {
        throw new Error('Erro ao atualizar saldo')
      }

      const data = await res.json()
      setBalance(data.balance)
      return true
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar saldo')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Função para verificar se tem saldo suficiente
  const hasEnoughBalance = async (amount: number): Promise<boolean> => {
    await loadBalance() // Recarrega saldo antes de verificar
    return balance >= amount
  }

  return {
    balance,
    loading,
    error,
    updateBalance,
    hasEnoughBalance,
    reloadBalance: loadBalance
  }
}
