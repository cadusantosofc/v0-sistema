"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useWallet } from "@/hooks/use-wallet"

export default function PostJobPage() {
  const { user, updateWallet, getAllUsers } = useAuth()
  const { createJob } = useJobs()
  const { balance } = useWallet(user?.id || "")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    type: "remote" as "remote" | "presencial" | "freelance",
    salary: "",
    requirements: [] as string[],
  })

  if (!user || user.role !== "company") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Acesso negado. Apenas empresas podem publicar vagas.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const jobCost = 10 // Comissão do sistema: R$10
  const currentBalance = balance

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      })
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const salary = Number.parseFloat(formData.salary)
    const totalCost = jobCost + salary // R$10 commission + salary to be held

    if (currentBalance < totalCost) {
      setError(
        `Saldo insuficiente. Você precisa de R$ ${totalCost.toFixed(2)} (R$ ${jobCost} comissão do sistema + R$ ${salary.toFixed(2)} para garantia do pagamento).`,
      )
      return
    }

    if (!formData.salary || salary <= 0) {
      setError("Informe um valor válido para o salário")
      return
    }

    setIsLoading(true)

    try {
      const jobId = createJob({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        type: formData.type,
        salary: salary,
        companyId: user.id,
        companyName: user.name,
        companyLogo: user.avatar,
        status: "active",
        requirements: formData.requirements,
      })

      if (jobId) {
        // Deduzir valor total da carteira da empresa
        const response = await fetch(`/api/wallet/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: -totalCost,
            description: `Vaga: ${formData.title} - Garantia de pagamento e comissão`
          })
        })

        if (!response.ok) {
          throw new Error("Erro ao processar pagamento")
        }

        setSuccess("Vaga publicada com sucesso! O valor foi retido como garantia.")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError("Erro ao publicar vaga. Tente novamente.")
      }
    } catch (err) {
      setError("Erro ao publicar vaga. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Publicar Nova Vaga</h1>
        <p className="text-gray-600">Encontre o profissional ideal para sua empresa</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Wallet Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Seu saldo atual</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Custo total</p>
              <p className="text-xl font-bold text-blue-600">
                R$ {(jobCost + Number.parseFloat(formData.salary || "0")).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Publicação + Garantia</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Como funciona:</strong> R$ {jobCost} para publicar a vaga + valor do salário fica retido como
              garantia até a conclusão do trabalho.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Vaga</CardTitle>
          <CardDescription>Preencha as informações da vaga que deseja publicar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Garçom para evento hoje"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="servicos">Serviços Gerais</SelectItem>
                    <SelectItem value="eventos">Eventos</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Vaga *</Label>
              <Textarea
                id="description"
                placeholder="Ex: Preciso de um garçom para trabalhar hoje das 18h às 22h em um evento corporativo. Experiência necessária."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  placeholder="Ex: São Paulo, SP"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Modalidade *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remoto</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Pagamento (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="salary"
                    type="number"
                    placeholder="70"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="pl-10"
                    min="0"
                    step="0.01"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <Label>Requisitos e Habilidades</Label>

              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Experiência em eventos, Uniforme próprio"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  disabled={isLoading}
                />
                <Button type="button" onClick={addRequirement} disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeRequirement(index)}
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || currentBalance < jobCost + Number.parseFloat(formData.salary || "0")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  `Publicar Vaga (R$ ${(jobCost + Number.parseFloat(formData.salary || "0")).toFixed(2)})`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
