"use client"

import { useState } from "react"
import { USERS } from "@/constants/users"
import { Balance } from "@/components/wallet/balance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminWalletPage() {
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [operationType, setOperationType] = useState<"add" | "remove">("add")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !amount) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          amount: Number(amount),
          type: operationType,
          description
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Erro ao atualizar saldo")
      }

      // Limpa form
      setAmount("")
      setDescription("")
      alert("Saldo atualizado com sucesso!")
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao atualizar saldo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Gerenciamento Manual de Carteira</h1>
        <p className="text-muted-foreground">
          Adicione ou remova saldo manualmente das carteiras dos usuários
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Tipo de Usuário */}
        <div className="space-y-2">
          <Label>Tipo de Usuário</Label>
          <Select
            value={selectedUser}
            onValueChange={(value) => setSelectedUser(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USERS.COMPANY.ID}>
                {USERS.COMPANY.NAME} (Empresa)
              </SelectItem>
              <SelectItem value={USERS.WORKER.ID}>
                {USERS.WORKER.NAME} (Profissional)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Saldo Atual */}
        {selectedUser && (
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium mb-1">Saldo Atual</p>
            <Balance userId={selectedUser} />
          </div>
        )}

        {/* Tipo de Operação */}
        <div className="space-y-2">
          <Label>Tipo de Operação</Label>
          <Select
            value={operationType}
            onValueChange={(value: "add" | "remove") => setOperationType(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">Adicionar Saldo</SelectItem>
              <SelectItem value="remove">Remover Saldo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <Label>Valor</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            placeholder="Motivo da operação"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={loading || !selectedUser || !amount}>
          {loading ? "Atualizando..." : "Atualizar Saldo"}
        </Button>
      </form>
    </div>
  )
}
