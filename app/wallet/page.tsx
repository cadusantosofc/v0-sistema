"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
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
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

type Transaction = {
  id: string
  from_wallet_id: string
  to_wallet_id: string
  sender_id: string
  receiver_id: string
  amount: number
  type: "deposit" | "withdrawal" | "transfer" | "payment" | "refund"
  status: "pending" | "completed" | "failed"
  description?: string
  created_at: string
}

// Função para obter o rótulo do tipo de transação
function getTransactionTypeLabel(transaction: Transaction): string {
  const types = {
    withdrawal: "Saque",
    deposit: "Depósito",
    transfer: "Transferência",
    payment: "Pagamento",
    refund: "Reembolso"
  };
  
  return types[transaction.type] || transaction.type;
}

// Função para obter a variante do badge com base no tipo de transação
function getTransactionTypeBadgeVariant(transaction: Transaction): "default" | "secondary" | "destructive" | "outline" {
  if (transaction.type === "withdrawal" || transaction.type === "payment") {
    return "destructive";
  } else if (transaction.type === "deposit" || transaction.type === "refund") {
    return "default";
  } else {
    return "secondary";
  }
}

// Função para obter o prefixo de valor (+ ou -) com base no tipo de transação
function getTransactionAmountPrefix(transaction: Transaction, userId: string): string {
  if (transaction.type === "withdrawal" || transaction.type === "payment") {
    return "-";
  } else if (transaction.type === "deposit" || transaction.type === "refund") {
    return "+";
  } else if (transaction.type === "transfer") {
    return transaction.sender_id === userId ? "-" : "+";
  }
  return "";
}

export default function WalletPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Carrega transações quando o usuário estiver autenticado
  useEffect(() => {
    // Se estiver carregando a autenticação ou não houver usuário, não faz nada
    if (authLoading || !user) {
      return;
    }

    const loadTransactions = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/wallet/transactions?userId=${user.id}`)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Erro ao carregar transações")
        }
        const data = await res.json()
        setTransactions(data)
      } catch (error) {
        console.error("Erro ao carregar transações:", error)
        // Mostra mensagem de erro mais amigável
        toast({
          variant: "destructive",
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao carregar transações",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [user, authLoading, toast])

  // Renderização condicional baseada no estado de autenticação
  if (authLoading) {
    return (
      <div className="container py-6 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-6">
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          Você precisa estar logado para acessar sua carteira
        </div>
      </div>
    )
  }

  // Renderização principal quando o usuário está autenticado
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">
          {user.name} - Gerencie seu saldo e transações
        </p>
      </div>

      {/* Card de Saldo */}
      <div className="rounded-lg border p-6 bg-card">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Saldo Disponível</p>
          <Balance userId={user.id} className="text-3xl font-bold text-green-500" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário de Saque */}
        <WithdrawForm 
          userId={user.id} 
          userName={user.name} 
        />

        {/* Formulário de Recarga */}
        <RechargeForm 
          userId={user.id} 
          userName={user.name} 
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Carregando transações...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getTransactionTypeBadgeVariant(transaction)}
                    >
                      {getTransactionTypeLabel(transaction)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.description || "Sem descrição"}
                  </TableCell>
                  <TableCell className={
                    getTransactionAmountPrefix(transaction, user.id) === "+" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }>
                    {getTransactionAmountPrefix(transaction, user.id)}
                    R$ {transaction.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {transaction.status === "completed"
                        ? "Concluído"
                        : transaction.status === "failed"
                        ? "Falhou"
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
