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

interface WithdrawFormProps {
  userId: string
  userName: string
}

export function WithdrawForm({ userId, userName }: WithdrawFormProps) {
  const [amount, setAmount] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { balance, loading: loadingBalance } = useWallet(userId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!amount || !pixKey) {
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

      if (value > balance) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Saldo insuficiente",
        })
        return
      }

      setLoading(true)

      const res = await fetch("/api/wallet/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userName,
          type: "withdrawal",
          amount: value,
          pixKey,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao criar solicitação")
      }

      toast({
        title: "Sucesso",
        description: "Solicitação de saque enviada com sucesso! Aguarde a aprovação do administrador.",
      })

      setAmount("")
      setPixKey("")
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
        <CardTitle>Solicitar Saque</CardTitle>
        <CardDescription>
          Solicite um saque do seu saldo disponível
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
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              type="text"
              placeholder="Sua chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="text-sm">
            Saldo disponível:{" "}
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
            disabled={
              loading ||
              loadingBalance ||
              !amount ||
              !pixKey ||
              Number(amount) > balance
            }
          >
            {loading ? "Processando..." : "Solicitar Saque"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
