"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/useWallet"
import { Balance } from "@/components/wallet/balance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { USERS } from "@/constants/users"

// Custo fixo para publicar uma vaga
const JOB_POSTING_COST = 10

export default function NewJobPage() {
  const router = useRouter()
  const { hasEnoughBalance, updateBalance } = useWallet(USERS.COMPANY.ID)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verifica se tem saldo suficiente
      const hasBalance = await hasEnoughBalance(JOB_POSTING_COST)
      if (!hasBalance) {
        alert("Saldo insuficiente para publicar vaga")
        return
      }

      // Debita o custo da vaga
      const success = await updateBalance(-JOB_POSTING_COST)
      if (!success) {
        alert("Erro ao debitar saldo")
        return
      }

      // Redireciona para dashboard
      router.push("/dashboard/company")
    } catch (error) {
      console.error("Erro ao publicar vaga:", error)
      alert("Erro ao publicar vaga")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Publicar Nova Vaga</h1>
        <p className="text-muted-foreground">
          Encontre o profissional ideal para sua empresa
        </p>
      </div>

      {/* Saldo e Custo */}
      <div className="rounded-lg border p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Seu saldo atual</p>
            <Balance 
              userId={USERS.COMPANY.ID} 
              className="text-2xl font-bold text-green-500" 
              formatOptions={{ style: 'currency', currency: 'BRL' }} 
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Custo total</p>
            <p className="text-2xl font-bold text-blue-500">
              R$ {JOB_POSTING_COST.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Publicação + Garantia</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-600">
            <strong>Como funciona:</strong> R$ {JOB_POSTING_COST} para publicar a vaga + valor do salário fica retido como garantia até a conclusão do trabalho.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Vaga</Label>
          <Input
            id="title"
            placeholder="Ex: Desenvolvedor Full Stack"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Descreva os requisitos e responsabilidades"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Orçamento (R$)</Label>
          <Input
            id="budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="1000.00"
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Publicando..." : "Publicar Vaga"}
          </Button>
        </div>
      </form>
    </div>
  )
}
