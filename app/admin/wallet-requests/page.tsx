"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
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
import { useWallet } from "@/hooks/use-wallet"

type Request = {
  id: string
  user_id: string
  user_name: string
  type: "deposit" | "withdrawal"
  amount: number
  status: "pending" | "approved" | "rejected"
  pix_key?: string
  receipt_url?: string
  created_at: Date
  updated_at: Date
  processed_at?: Date
  processed_by?: string
  current_balance?: number
}

export default function WalletRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [viewReceipt, setViewReceipt] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  // Redirecionar se não estiver autenticado ou não for admin
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "admin") {
      router.push("/")
      return
    }
  }, [user, router])

  // Carrega solicitações
  useEffect(() => {
    loadRequests()
  }, [])

  // Função para carregar solicitações
  const loadRequests = async () => {
    try {
      const res = await fetch("/api/admin/wallet-requests")
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
      const res = await fetch(`/api/admin/wallet-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          action: approve ? "approve" : "reject",
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
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold">Solicitações de Carteira</h1>
        <p className="text-muted-foreground">
          Gerencie solicitações de saque e recarga dos usuários
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Nenhuma solicitação pendente</h3>
          <p className="text-muted-foreground">
            Não há solicitações de saque ou recarga pendentes no momento.
          </p>
        </div>
      ) : (
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
      )}

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
  const isPending = request.status === "pending"
  const isWithdrawal = request.type === "withdrawal"
  const hasBalance = (request.current_balance || 0) >= request.amount

  return (
    <TableRow>
      <TableCell>
        {new Date(request.created_at).toLocaleDateString("pt-BR")}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{request.user_name}</span>
          <span className="text-xs text-muted-foreground">{request.user_id}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={isWithdrawal ? "destructive" : "default"}>
          {isWithdrawal ? "Saque" : "Depósito"}
        </Badge>
        {isWithdrawal && request.pix_key && (
          <div className="mt-1 text-xs text-muted-foreground">
            PIX: {request.pix_key}
          </div>
        )}
      </TableCell>
      <TableCell>
        <span className="font-medium">
          R$ {request.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "font-medium",
            isWithdrawal && isPending && !hasBalance && "text-destructive"
          )}
        >
          R$ {(request.current_balance || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            request.status === "approved"
              ? "default"
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
                title={isWithdrawal && !hasBalance ? "Saldo insuficiente" : undefined}
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
          {request.receipt_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewReceipt(request.receipt_url!)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
