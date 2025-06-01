"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useWallet } from "@/hooks/useWallet"

type Request = {
  id: string
  userId: string
  userName: string
  type: "withdrawal" | "recharge"
  amount: number
  status: "pending" | "approved" | "rejected"
  pixKey?: string
  receiptUrl?: string
  createdAt: string
  processedAt?: string
}

export default function WalletRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [viewReceipt, setViewReceipt] = useState<string | null>(null)
  const { toast } = useToast()

  // Carrega solicitações
  useEffect(() => {
    loadRequests()
  }, [])

  // Função para carregar solicitações
  const loadRequests = async () => {
    try {
      const res = await fetch("/api/wallet/requests")
      if (!res.ok) throw new Error("Erro ao carregar solicitações")
      const data = await res.json()
      setRequests(data)
    } catch (error) {
      console.error("Erro:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar solicitações",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para aprovar/rejeitar
  const handleApprove = async (requestId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/wallet/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: approve ? "approved" : "rejected",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar solicitação")
      }

      // Atualiza lista de solicitações
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: approve ? "approved" : "rejected" }
            : req
        )
      )

      toast({
        title: approve ? "Aprovado" : "Rejeitado",
        description: approve
          ? `Solicitação aprovada. Novo saldo: R$ ${data.wallet.balance.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`
          : "Solicitação rejeitada",
      })
    } catch (error: any) {
      console.error("Erro:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao processar solicitação",
      })
    }
  }

  return (
    <div className="container py-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Saldo Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onViewReceipt={setViewReceipt}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewReceipt} onOpenChange={() => setViewReceipt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visualizar Comprovante</DialogTitle>
          </DialogHeader>
          {viewReceipt && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={viewReceipt}
                alt="Comprovante"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente de linha da tabela
function RequestRow({
  request,
  onApprove,
  onViewReceipt,
}: {
  request: Request
  onApprove: (id: string, approve: boolean) => Promise<void>
  onViewReceipt: (url: string) => void
}) {
  const { balance, loading } = useWallet(request.userId)
  const isPending = request.status === "pending"
  const isWithdrawal = request.type === "withdrawal"
  const hasBalance = balance >= request.amount

  return (
    <TableRow>
      <TableCell>
        {new Date(request.createdAt).toLocaleDateString("pt-BR")}
      </TableCell>
      <TableCell>{request.userName}</TableCell>
      <TableCell>
        <Badge variant={isWithdrawal ? "destructive" : "default"}>
          {isWithdrawal ? "Saque" : "Recarga"}
        </Badge>
      </TableCell>
      <TableCell>
        R$ {request.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "font-medium",
            isWithdrawal && isPending && !hasBalance && "text-destructive"
          )}
        >
          {loading ? (
            "Carregando..."
          ) : (
            `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
          )}
        </span>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            request.status === "approved"
              ? "success"
              : request.status === "rejected"
              ? "destructive"
              : "secondary"
          }
        >
          {request.status === "approved"
            ? "Aprovado"
            : request.status === "rejected"
            ? "Rejeitado"
            : "Pendente"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => onApprove(request.id, true)}
                disabled={isWithdrawal && !hasBalance}
              >
                Aprovar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onApprove(request.id, false)}
              >
                Rejeitar
              </Button>
            </>
          )}
          {request.receiptUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewReceipt(request.receiptUrl!)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
