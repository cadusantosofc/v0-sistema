"use client"

import { useState } from "react"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface RechargeFormProps {
  userId: string
  userName: string
}

export function RechargeForm({ userId, userName }: RechargeFormProps) {
  const [amount, setAmount] = useState("")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { balance, loading: loadingBalance } = useWallet(userId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!amount || !receipt) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Preencha todos os campos",
        })
        return
      }

      const value = Number(amount)
      if (value <= 0) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Valor deve ser maior que zero",
        })
        return
      }

      setLoading(true)

      // Simula upload do comprovante (em um sistema real, você faria upload para um serviço como S3)
      // e obteria a URL do arquivo
      const receiptUrl = `/uploads/${receipt.name}`

      // Criar solicitação de recarga
      const res = await fetch("/api/wallet/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userName,
          type: "recharge",
          amount: value,
          receiptUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao criar solicitação")
      }

      toast({
        title: "Sucesso",
        description: "Solicitação de recarga enviada com sucesso! Aguarde a aprovação do administrador.",
      })

      setAmount("")
      setReceipt(null)
    } catch (error: any) {
      console.error("Erro:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar solicitação",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Recarga</CardTitle>
        <CardDescription>
          Adicione saldo à sua carteira
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Comprovante</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </div>

          <div className="text-sm">
            Saldo atual:{" "}
            <span className="font-medium">
              {loadingBalance
                ? "Carregando..."
                : `R$ ${balance.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`}
            </span>
          </div>

          <Button
            type="submit"
            disabled={loading || !amount || !receipt}
          >
            {loading ? "Processando..." : "Solicitar Recarga"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
