"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, MapPin } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useApplications } from "@/lib/applications-context"

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    salary: number
    type: string
    category: string
    description: string
    requirements: string[]
    createdAt: string
    companyId: string
  }
  showActions?: boolean
}

export function JobCard({ job, showActions = true }: JobCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { applyForJob, hasApplied } = useApplications()

  const handleApply = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      await applyForJob(job.id, user.id)
    } catch (error) {
      console.error("Erro ao se candidatar:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const alreadyApplied = user ? hasApplied(job.id, user.id) : false
  const canApply = user?.role === "worker" && !alreadyApplied

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
          </div>
          <Badge variant={job.type === "full_time" ? "default" : "secondary"}>
            {job.type === "full_time" ? "Tempo Integral" : "Freelancer"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            {job.location}
          </div>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
            {job.salary.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            {formatDistanceToNow(new Date(job.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
        <div className="flex flex-wrap gap-2">
          {job.requirements.map((req, index) => (
            <Badge key={index} variant="outline">
              {req}
            </Badge>
          ))}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-between">
          <Link href={`/jobs/${job.id}`}>
            <Button variant="outline">Ver Detalhes</Button>
          </Link>
          {canApply && (
            <Button 
              onClick={handleApply} 
              disabled={isLoading || alreadyApplied}
            >
              {alreadyApplied ? "Candidatura Enviada" : "Candidatar-se"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
