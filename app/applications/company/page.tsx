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
  Briefcase, 
  Calendar, 
  ChevronDown, 
  FileText, 
  MessageSquare, 
  Star,
  User
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Application {
  id: string
  jobId: string
  jobTitle: string
  userId: string
  userName: string
  userAvatar: string
  userResume: string
  experience: string
  status: "pending" | "accepted" | "rejected" | "interviewing"
  createdAt: string
  chatId?: string
}

const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500" },
  accepted: { label: "Aceito", color: "bg-green-500" },
  rejected: { label: "Recusado", color: "bg-red-500" },
  interviewing: { label: "Em Entrevista", color: "bg-blue-500" },
}

export default function CompanyApplicationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Aqui você deve integrar com sua API
        const response = await fetch(`/api/companies/${user?.companyId}/applications`)
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error("Erro ao carregar candidaturas:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.companyId) {
      fetchApplications()
    }
  }, [user])

  const createChat = async (application: Application) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: application.userId,
          companyId: user?.companyId,
          jobId: application.jobId,
        }),
      })

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error("Erro ao criar chat:", error)
      return null
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // Aqui você deve integrar com sua API
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      // Se o status for "accepted", cria um chat
      if (newStatus === "accepted") {
        const application = applications.find(app => app.id === applicationId)
        if (application) {
          const chatId = await createChat(application)
          if (chatId) {
            router.push(`/chat/${chatId}`)
          }
        }
      }

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus as Application["status"] } : app
      ))
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const reviewCandidate = async (applicationId: string, rating: number, comment: string) => {
    try {
      // Aqui você deve integrar com sua API
      await fetch(`/api/applications/${applicationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      })
    } catch (error) {
      console.error("Erro ao avaliar candidato:", error)
    }
  }

  if (!user?.companyId) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Candidaturas Recebidas</h1>
        <p className="text-muted-foreground">
          Gerencie as candidaturas para suas vagas
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-1/4 bg-muted rounded" />
                <div className="h-3 w-1/3 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={application.userAvatar} alt={application.userName} />
                      <AvatarFallback>{application.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{application.userName}</h3>
                      <p className="text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4 inline mr-1" />
                        {application.jobTitle}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={`${statusMap[application.status].color} text-white`}
                  >
                    {statusMap[application.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {application.experience}
                    <Calendar className="h-4 w-4 ml-4 mr-2" />
                    {formatDistanceToNow(new Date(application.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Link href={application.userResume} target="_blank">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Currículo
                      </Button>
                    </Link>
                    {(application.status === "interviewing" || application.status === "accepted") && application.chatId && (
                      <Link href={`/chat/${application.chatId}`}>
                        <Button variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      </Link>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button>
                          Ações
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={() => updateApplicationStatus(application.id, "interviewing")}
                          disabled={application.status === "interviewing"}
                        >
                          Chamar para Entrevista
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateApplicationStatus(application.id, "accepted")}
                          disabled={application.status === "accepted"}
                        >
                          Aceitar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateApplicationStatus(application.id, "rejected")}
                          disabled={application.status === "rejected"}
                        >
                          Recusar
                        </DropdownMenuItem>
                        {application.status === "accepted" && (
                          <DropdownMenuItem
                            onClick={() => {
                              // Aqui você pode abrir um modal para avaliação
                              reviewCandidate(application.id, 5, "Ótimo trabalho!")
                            }}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Avaliar Candidato
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma candidatura ainda</CardTitle>
            <CardDescription>
              As candidaturas para suas vagas aparecerão aqui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/jobs/new">
              <Button>Publicar Nova Vaga</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
