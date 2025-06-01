"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Building, Wallet, Briefcase, Plus, Minus, Ban, CheckCircle, XCircle, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useActivityLog } from "@/lib/activity-log-context"

export default function AdminPage() {
  const { user, getAllUsers, updateWallet } = useAuth()
  const { jobs } = useJobs()
  const { getRecentActivities } = useActivityLog()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [walletAmount, setWalletAmount] = useState("")
  const [success, setSuccess] = useState("")

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Acesso negado. Apenas administradores podem acessar esta página.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const allUsers = getAllUsers()
  const companies = allUsers.filter((u) => u.role === "company")
  const workers = allUsers.filter((u) => u.role === "worker")
  const totalWallet = allUsers.reduce((sum, u) => sum + u.wallet, 0)
  const recentActivities = getRecentActivities(10)

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleWalletUpdate = (operation: "add" | "remove") => {
    if (!selectedUser || !walletAmount) return

    const amount = Number.parseFloat(walletAmount)
    if (isNaN(amount) || amount <= 0) return

    const finalAmount = operation === "add" ? amount : -amount
    updateWallet(selectedUser, finalAmount)

    setSuccess(`Saldo ${operation === "add" ? "adicionado" : "removido"} com sucesso!`)
    setWalletAmount("")
    setSelectedUser("")
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-gray-600">Controle total da plataforma</p>
      </div>

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              {workers.length} profissionais, {companies.length} empresas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">Empresas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Financeiro</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalWallet.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total em carteiras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Publicadas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">{jobs.filter((j) => j.status === "active").length} ativas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Wallet Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Carteiras</CardTitle>
            <CardDescription>Adicionar ou remover saldo dos usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Selecionar Usuário</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Selecione um usuário</option>
                {allUsers
                  .filter((u) => u.role !== "admin")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) - R$ {u.wallet.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                onClick={() => handleWalletUpdate("add")}
                disabled={!selectedUser || !walletAmount}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Saldo
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleWalletUpdate("remove")}
                disabled={!selectedUser || !walletAmount}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-2" />
                Remover Saldo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuários</CardTitle>
            <CardDescription>Buscar e gerenciar contas de usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={u.avatar || "/placeholder.svg"} alt={u.name} />
                        <AvatarFallback>
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-sm text-gray-600 truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant={u.role === "admin" ? "default" : u.role === "company" ? "secondary" : "outline"}
                          >
                            {u.role === "admin" ? "Admin" : u.role === "company" ? "Empresa" : "Profissional"}
                          </Badge>
                          <span className="text-sm text-green-600 font-medium">
                            R$ {u.wallet.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Últimas ações na plataforma em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        activity.type === "job"
                          ? "bg-blue-500"
                          : activity.type === "payment"
                            ? "bg-green-500"
                            : activity.type === "wallet"
                              ? "bg-yellow-500"
                              : activity.type === "application"
                                ? "bg-purple-500"
                                : activity.type === "profile"
                                  ? "bg-orange-500"
                                  : "bg-gray-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {activity.userName} (
                        {activity.userRole === "admin"
                          ? "Admin"
                          : activity.userRole === "company"
                            ? "Empresa"
                            : "Profissional"}
                        )
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(activity.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Nenhuma atividade recente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
