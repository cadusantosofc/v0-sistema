"use client"

import { useState } from "react"
import { USERS } from "@/constants/users"
import { WalletDisplay } from "@/components/wallet-display"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminWalletPage() {
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [operationType, setOperationType] = useState<"add" | "remove">("add")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const { updateBalance, loading } = useWallet(selectedUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !amount) return

    setSuccess("")
    setError("")

    const value = operationType === "add" ? Number(amount) : -Number(amount)
    const result = await updateBalance(value)

    if (result) {
      setSuccess(`Saldo atualizado com sucesso!`)
      setAmount("")
      setDescription("")
    } else {
      setError("Erro ao atualizar saldo")
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
            <WalletDisplay userId={selectedUser} />
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

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={loading || !selectedUser || !amount}>
          {loading ? "Atualizando..." : "Atualizar Saldo"}
        </Button>
      </form>
    </div>
  )
}
