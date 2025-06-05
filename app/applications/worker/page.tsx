"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, MessageSquare, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Application {
  id: string
  jobId: string
  userId: string
  companyId: string
  status: "pending" | "accepted" | "rejected" | "interviewing"
  coverLetter: string
  createdAt: string
  job: {
    id: string
    title: string
    company: {
      id: string
      name: string
      avatar: string
    }
    salary: number
    location: string
    type: string
  }
  chatId?: string
}

export default function WorkerApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/applications?userId=1") // TODO: usar ID real do usuário
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error("Erro ao carregar candidaturas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const filteredApplications = applications.filter(app => 
    app.job.title.toLowerCase().includes(search.toLowerCase()) ||
    app.job.company.name.toLowerCase().includes(search.toLowerCase()) ||
    app.job.location.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors = {
    pending: "bg-yellow-500",
    accepted: "bg-green-500",
    rejected: "bg-red-500",
    interviewing: "bg-blue-500"
  }

  const statusLabels = {
    pending: "Pendente",
    accepted: "Aceito",
    rejected: "Recusado",
    interviewing: "Entrevista"
  }

  if (loading) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="h-10 w-full bg-muted rounded" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 w-full bg-muted rounded" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Minhas Candidaturas</CardTitle>
          <CardDescription>Acompanhe o status das suas candidaturas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por vaga, empresa ou localização..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-6">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-1">Nenhuma candidatura encontrada</h3>
              <p className="text-sm text-muted-foreground">
                {search ? "Tente outros termos de busca" : "Você ainda não se candidatou a nenhuma vaga"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(application => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium">{application.job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {application.job.company.name} • {application.job.location}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        R$ {application.job.salary ? application.job.salary.toLocaleString("pt-BR") : application.job.payment_amount ? application.job.payment_amount.toLocaleString("pt-BR") : application.job.salary_range || '0,00'}
                      </Badge>
                      <Badge variant="outline">{application.job.type}</Badge>
                      <span>
                        Enviada {formatDistanceToNow(new Date(application.createdAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[application.status]}>
                      {statusLabels[application.status]}
                    </Badge>
                    {application.chatId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/chat/${application.chatId}`)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/jobs/${application.jobId}`}>
                        Ver Vaga
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
