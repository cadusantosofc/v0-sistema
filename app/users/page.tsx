"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  Ban,
  ChevronDown,
  Mail,
  MoreVertical,
  Search,
  Shield,
  User
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Balance } from "@/components/wallet/balance"

interface SystemUser {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "company" | "worker"
  status: "active" | "banned"
  createdAt: string
}

const roleMap = {
  admin: { label: "Admin", color: "bg-purple-500" },
  company: { label: "Empresa", color: "bg-blue-500" },
  worker: { label: "Profissional", color: "bg-green-500" },
}

const statusMap = {
  active: { label: "Ativo", color: "bg-green-500" },
  banned: { label: "Banido", color: "bg-red-500" },
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Aqui você deve integrar com sua API
        const response = await fetch("/api/admin/users")
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("Erro ao carregar usuários:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "admin") {
      fetchUsers()
    }
  }, [user])

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      // Aqui você deve integrar com sua API
      await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus as SystemUser["status"] } : u
      ))
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Aqui você deve integrar com sua API
      await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as SystemUser["role"] } : u
      ))
    } catch (error) {
      console.error("Erro ao atualizar cargo:", error)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuários do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários da plataforma
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>
              Aguarde enquanto carregamos os usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : filteredUsers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {user.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${roleMap[user.role].color} text-white`}>
                        {roleMap[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusMap[user.status].color} text-white`}>
                        {statusMap[user.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Balance userId={user.id} />
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="flex items-center"
                            onClick={() => {
                              window.location.href = `mailto:${user.email}`
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center"
                            onClick={() => updateUserRole(user.id, "admin")}
                            disabled={user.role === "admin"}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Tornar Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-red-600"
                            onClick={() => updateUserStatus(user.id, user.status === "active" ? "banned" : "active")}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            {user.status === "active" ? "Banir" : "Desbanir"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum usuário encontrado</CardTitle>
            <CardDescription>
              Tente ajustar sua busca
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
