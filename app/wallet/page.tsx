"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallet"
import { Balance } from "@/components/wallet/balance"
import { WithdrawForm } from "@/components/wallet/withdraw-form"
import { RechargeForm } from "@/components/wallet/recharge-form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { USERS } from "@/constants/users"

// IDs constantes
const CURRENT_USER_ID = USERS.COMPANY.ID
const CURRENT_USER_NAME = USERS.COMPANY.NAME

type Transaction = {
  id: string
  userId: string
  type: "withdrawal" | "recharge" | "job"
  amount: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Carrega transações
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/wallet/transactions?userId=${CURRENT_USER_ID}`)
        if (!res.ok) throw new Error("Erro ao carregar transações")
        const data = await res.json()
        setTransactions(data)
      } catch (error) {
        console.error("Erro:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">
          {CURRENT_USER_NAME} - Gerencie seu saldo e transações
        </p>
      </div>

      {/* Card de Saldo */}
      <div className="rounded-lg border p-6 bg-card">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Saldo Disponível</p>
          <Balance userId={CURRENT_USER_ID} className="text-3xl font-bold text-green-500" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário de Saque */}
        <WithdrawForm 
          userId={CURRENT_USER_ID} 
          userName={CURRENT_USER_NAME} 
        />

        {/* Formulário de Recarga */}
        <RechargeForm 
          userId={CURRENT_USER_ID} 
          userName={CURRENT_USER_NAME} 
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Carregando transações...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "withdrawal"
                          ? "destructive"
                          : transaction.type === "recharge"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {transaction.type === "withdrawal"
                        ? "Saque"
                        : transaction.type === "recharge"
                        ? "Recarga"
                        : "Trabalho"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    R$ {transaction.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "approved"
                          ? "success"
                          : transaction.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {transaction.status === "approved"
                        ? "Aprovado"
                        : transaction.status === "rejected"
                        ? "Rejeitado"
                        : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
