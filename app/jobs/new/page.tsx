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

      // Coleta os dados do formulário
      const formData = new FormData(e.currentTarget)
      const jobData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        requirements: formData.get('requirements') as string || '',
        salary_range: formData.get('budget') as string,
        location: formData.get('location') as string || 'Remoto',
        type: formData.get('type') as string || 'full_time',
        category: formData.get('category') as string || 'outros',
        company_id: USERS.COMPANY.ID,
        status: 'open'
      }

      // Envia os dados para a API
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar vaga')
      }

      // Debita o custo da vaga apenas se a criação for bem-sucedida
      const success = await updateBalance(-JOB_POSTING_COST)
      if (!success) {
        throw new Error("Erro ao debitar saldo")
      }

      // Redireciona para a página de vagas
      router.push("/jobs")
    } catch (error: any) {
      console.error("Erro ao publicar vaga:", error)
      alert(error.message || "Erro ao publicar vaga")
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
            name="description"
            placeholder="Descreva as responsabilidades e atividades da vaga"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requisitos</Label>
          <Textarea
            id="requirements"
            name="requirements"
            placeholder="Liste os requisitos necessários, separados por vírgula"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            name="location"
            placeholder="Ex: Remoto, São Paulo - SP"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Vaga</Label>
          <select
            id="type"
            name="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="full_time">Tempo Integral</option>
            <option value="part_time">Meio Período</option>
            <option value="contract">Contrato</option>
            <option value="internship">Estágio</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            placeholder="Ex: Desenvolvimento, Design, Marketing"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Faixa Salarial (R$)</Label>
          <Input
            id="budget"
            name="budget"
            type="text"
            placeholder="Ex: 3000.00 - 5000.00"
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
