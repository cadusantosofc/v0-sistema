"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Transaction {
  id: string
  userId: string
  type: "credit" | "debit" | "hold" | "release"
  amount: number
  description: string
  status: "completed" | "pending" | "failed" | "held"
  relatedUserId?: string
  jobId?: string
  createdAt: string
  updatedAt: string
}

export interface BalanceRequest {
  id: string
  userId: string
  userName: string
  type: "recharge" | "withdrawal"
  amount: number
  status: "pending" | "approved" | "rejected"
  pixKey?: string
  createdAt: string
  processedAt?: string
  processedBy?: string
}

interface TransactionsContextType {
  transactions: Transaction[]
  balanceRequests: BalanceRequest[]
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  getUserTransactions: (userId: string) => Transaction[]
  createBalanceRequest: (request: Omit<BalanceRequest, "id" | "createdAt">) => void
  processBalanceRequest: (
    requestId: string,
    approved: boolean,
    processedBy: string,
    updateWallet: (userId: string, amount: number) => void,
  ) => void
  getPendingRequests: () => BalanceRequest[]
  getUserRequests: (userId: string) => BalanceRequest[]
  holdJobPayment: (jobId: string, companyId: string, amount: number, description: string) => boolean
  releaseJobPayment: (
    jobId: string,
    workerId: string,
    updateWallet: (userId: string, amount: number) => void,
  ) => boolean
  cancelJobPayment: (jobId: string, updateWallet: (userId: string, amount: number) => void) => boolean
  calculateBalance: (userId: string, baseWallet: number) => number
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined)

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balanceRequests, setBalanceRequests] = useState<BalanceRequest[]>([])

  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    const savedRequests = localStorage.getItem("balanceRequests")

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
    if (savedRequests) {
      setBalanceRequests(JSON.parse(savedRequests))
    }
  }, [])

  const saveTransactions = (updated: Transaction[]) => {
    setTransactions(updated)
    localStorage.setItem("transactions", JSON.stringify(updated))
  }

  const saveRequests = (updated: BalanceRequest[]) => {
    setBalanceRequests(updated)
    localStorage.setItem("balanceRequests", JSON.stringify(updated))
  }

  const addTransaction = (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [...transactions, newTransaction]
    saveTransactions(updated)
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
    )
    saveTransactions(updated)
  }

  const getUserTransactions = (userId: string) => {
    return transactions
      .filter((t) => t.userId === userId || t.relatedUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const createBalanceRequest = (request: Omit<BalanceRequest, "id" | "createdAt">) => {
    const newRequest: BalanceRequest = {
      ...request,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    const updated = [...balanceRequests, newRequest]
    saveRequests(updated)
  }

  const processBalanceRequest = (
    requestId: string,
    approved: boolean,
    processedBy: string,
    updateWallet: (userId: string, amount: number) => void,
  ) => {
    const request = balanceRequests.find((r) => r.id === requestId)
    if (!request) return

    const updated = balanceRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: approved ? ("approved" as const) : ("rejected" as const),
            processedAt: new Date().toISOString(),
            processedBy,
          }
        : r,
    )
    saveRequests(updated)

    if (approved) {
      if (request.type === "recharge") {
        // Apenas registra a transação para histórico
        addTransaction({
          userId: request.userId,
          type: "credit",
          amount: request.amount,
          description: `Recarga aprovada pelo administrador`,
          status: "completed",
          relatedUserId: processedBy,
        })

        // Atualiza APENAS a carteira do usuário - SEM DUPLICAR
        updateWallet(request.userId, request.amount)
      } else if (request.type === "withdrawal") {
        // Apenas registra a transação para histórico
        addTransaction({
          userId: request.userId,
          type: "debit",
          amount: -request.amount,
          description: `Saque aprovado - PIX: ${request.pixKey}`,
          status: "completed",
          relatedUserId: processedBy,
        })

        // Atualiza APENAS a carteira do usuário - SEM DUPLICAR
        updateWallet(request.userId, -request.amount)
      }
    }
  }

  const getPendingRequests = () => {
    return balanceRequests
      .filter((r) => r.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getUserRequests = (userId: string) => {
    return balanceRequests
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const holdJobPayment = (jobId: string, companyId: string, amount: number, description: string): boolean => {
    addTransaction({
      userId: companyId,
      type: "hold",
      amount: -amount,
      description,
      status: "held",
      jobId,
    })
    return true
  }

  const releaseJobPayment = (
    jobId: string,
    workerId: string,
    updateWallet: (userId: string, amount: number) => void,
  ): boolean => {
    // Find the held transaction
    const heldTransaction = transactions.find((t) => t.jobId === jobId && t.type === "hold" && t.status === "held")

    if (!heldTransaction) return false

    // Update held transaction to completed
    updateTransaction(heldTransaction.id, { status: "completed" })

    // Create credit transaction for worker
    addTransaction({
      userId: workerId,
      type: "credit",
      amount: Math.abs(heldTransaction.amount),
      description: `Pagamento recebido - ${heldTransaction.description}`,
      status: "completed",
      jobId,
      relatedUserId: heldTransaction.userId,
    })

    // Update worker wallet
    updateWallet(workerId, Math.abs(heldTransaction.amount))

    return true
  }

  const cancelJobPayment = (jobId: string, updateWallet: (userId: string, amount: number) => void): boolean => {
    // Find the held transaction
    const heldTransaction = transactions.find((t) => t.jobId === jobId && t.type === "hold" && t.status === "held")

    if (!heldTransaction) return false

    // Update held transaction to failed
    updateTransaction(heldTransaction.id, { status: "failed" })

    // Return money to company
    addTransaction({
      userId: heldTransaction.userId,
      type: "credit",
      amount: Math.abs(heldTransaction.amount),
      description: `Reembolso - Vaga cancelada`,
      status: "completed",
      jobId,
    })

    // Update company wallet
    updateWallet(heldTransaction.userId, Math.abs(heldTransaction.amount))

    return true
  }

  const calculateBalance = (userId: string, baseWallet: number): number => {
    // SEMPRE retorna apenas o saldo base da carteira
    // Transações são apenas para histórico
    return Math.max(0, baseWallet)
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        balanceRequests,
        addTransaction,
        updateTransaction,
        getUserTransactions,
        createBalanceRequest,
        processBalanceRequest,
        getPendingRequests,
        getUserRequests,
        holdJobPayment,
        releaseJobPayment,
        cancelJobPayment,
        calculateBalance,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsProvider")
  }
  return context
}
