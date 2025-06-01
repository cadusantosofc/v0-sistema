"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Clock, MapPin, DollarSign, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Application {
  id: string
  jobId: string
  jobTitle: string
  companyId: string
  companyName: string
  companyAvatar: string
  location: string
  salary: string
  status: "pending" | "accepted" | "rejected" | "interviewing"
  createdAt: string
}

const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500" },
  accepted: { label: "Aceito", color: "bg-green-500" },
  rejected: { label: "Recusado", color: "bg-red-500" },
  interviewing: { label: "Em Entrevista", color: "bg-blue-500" },
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Aqui você deve integrar com sua API
        const response = await fetch(`/api/users/${user?.id}/applications`)
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error("Erro ao carregar candidaturas:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchApplications()
    }
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Minhas Candidaturas</h1>
        <p className="text-muted-foreground">
          Acompanhe o status das suas candidaturas
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={application.companyAvatar} alt={application.companyName} />
                      <AvatarFallback>{application.companyName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {application.companyName}
                      </CardDescription>
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
                    <MapPin className="h-4 w-4 mr-2" />
                    {application.location}
                    <DollarSign className="h-4 w-4 ml-4 mr-2" />
                    {application.salary}
                    <Clock className="h-4 w-4 ml-4 mr-2" />
                    {formatDistanceToNow(new Date(application.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Link href={`/jobs/${application.jobId}`}>
                      <Button variant="outline">Ver Vaga</Button>
                    </Link>
                    {application.status === "interviewing" && (
                      <Link href={`/chat/${application.companyId}`}>
                        <Button>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat com Empresa
                        </Button>
                      </Link>
                    )}
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
              Suas candidaturas aparecerão aqui quando você se candidatar a uma vaga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/jobs">
              <Button>Ver Vagas Disponíveis</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
