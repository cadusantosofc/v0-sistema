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
  Building2,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Search,
  Star,
  Users
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Company {
  id: string
  name: string
  email: string
  phone: string
  website: string
  location: string
  logo: string
  status: "active" | "banned"
  totalJobs: number
  totalHires: number
  rating: number
  createdAt: string
}

const statusMap = {
  active: { label: "Ativa", color: "bg-green-500" },
  banned: { label: "Banida", color: "bg-red-500" },
}

export default function CompaniesPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Aqui você deve integrar com sua API
        const response = await fetch("/api/admin/companies")
        const data = await response.json()
        setCompanies(data)
      } catch (error) {
        console.error("Erro ao carregar empresas:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "admin") {
      fetchCompanies()
    }
  }, [user])

  const updateCompanyStatus = async (companyId: string, newStatus: string) => {
    try {
      // Aqui você deve integrar com sua API
      await fetch(`/api/admin/companies/${companyId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, status: newStatus as Company["status"] } : c
      ))
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.email.toLowerCase().includes(search.toLowerCase()) ||
    company.location.toLowerCase().includes(search.toLowerCase())
  )

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-muted-foreground">
          Gerencie as empresas cadastradas na plataforma
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou localização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-[200px] bg-muted rounded" />
                    <div className="h-3 w-[150px] bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredCompanies.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Vagas/Contratações</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={company.logo} alt={company.name} />
                          <AvatarFallback>{company.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {company.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{company.totalJobs}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{company.totalHires}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-primary text-primary" />
                        <span>{company.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusMap[company.status].color} text-white`}>
                        {statusMap[company.status].label}
                      </Badge>
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
                              window.location.href = `mailto:${company.email}`
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center"
                            onClick={() => {
                              window.open(company.website, "_blank")
                            }}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Visitar Site
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center"
                            onClick={() => {
                              window.location.href = `tel:${company.phone}`
                            }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Ligar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-red-600"
                            onClick={() => updateCompanyStatus(company.id, company.status === "active" ? "banned" : "active")}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            {company.status === "active" ? "Banir" : "Desbanir"}
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
            <CardTitle>Nenhuma empresa encontrada</CardTitle>
            <CardDescription>
              Tente ajustar sua busca
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
