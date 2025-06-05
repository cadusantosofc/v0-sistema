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
  id: number
  job_id: string
  worker_id: string
  company_id: string
  status: "pending" | "accepted" | "rejected" | "accepted_by_company" | "in_progress" | "active"
  cover_letter: string
  created_at: string
  job: {
    id: string
    title: string
    location: string
    salary_range: string
    company: {
      id: string
      name: string
      avatar?: string
    }
    status: string
  }
}

const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500" },
  accepted: { label: "Aceito", color: "bg-green-500" },
  rejected: { label: "Recusado", color: "bg-red-500" },
  accepted_by_company: { label: "Aceito pela empresa", color: "bg-green-500" },
  in_progress: { label: "Em progresso", color: "bg-yellow-500" },
  active: { label: "Ativo", color: "bg-green-500" }
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        if (!user?.id) {
          console.error("ID do usuário não disponível");
          return;
        }
        
        console.log("Buscando candidaturas para o usuário:", user.id);
        
        // Verifica se é um trabalhador
        if (user.role === 'worker') {
          const response = await fetch(`/api/applications?userId=${user.id}`);
          
          if (!response.ok) {
            throw new Error(`Erro ao buscar candidaturas: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Candidaturas encontradas:", data.length);
          setApplications(data);
        } 
        // Se for uma empresa, busca as candidaturas para suas vagas
        else if (user.role === 'company') {
          const response = await fetch(`/api/applications?companyId=${user.id}`);
          
          if (!response.ok) {
            throw new Error(`Erro ao buscar candidaturas: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Candidaturas para as vagas da empresa:", data.length);
          setApplications(data);
        }
      } catch (error) {
        console.error("Erro ao carregar candidaturas:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user]);

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
                      <AvatarImage src={application.job.company.avatar} alt={application.job.company.name} />
                      <AvatarFallback>{application.job.company.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{application.job.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {application.job.company.name}
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
                    {application.job.location}
                    <DollarSign className="h-4 w-4 ml-4 mr-2" />
                    {application.job.salary_range}
                    <Clock className="h-4 w-4 ml-4 mr-2" />
                    {formatDistanceToNow(new Date(application.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Link href={`/jobs/${application.job_id}`}>
                      <Button variant="outline">Ver Vaga</Button>
                    </Link>
                    {['accepted', 'accepted_by_company', 'in_progress', 'active'].includes(application.status) && (
                      <Link href={`/chat/${application.job.company_id}`}>
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
