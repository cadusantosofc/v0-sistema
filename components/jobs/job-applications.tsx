"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useApplications } from "@/lib/applications-context"
import type { JobApplication } from "@/lib/applications-context"

interface JobApplicationsProps {
  jobId: string
}

export function JobApplications({ jobId }: JobApplicationsProps) {
  const [loading, setLoading] = useState<string>("")
  const { user, getUserById } = useAuth()
  const { getJobApplications, updateApplicationStatus } = useApplications()

  // Se não for empresa ou admin, não mostra as candidaturas
  if (!user || (user.role !== "company" && user.role !== "admin")) {
    return null
  }

  const applications = getJobApplications(jobId)

  const handleUpdateStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    setLoading(applicationId)
    try {
      updateApplicationStatus(applicationId, status)
    } finally {
      setLoading("")
    }
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidaturas</CardTitle>
          <CardDescription>Ainda não há candidaturas para esta vaga</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidaturas</CardTitle>
        <CardDescription>Gerencie as candidaturas para esta vaga</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.map((application) => {
          const applicant = getUserById(application.applicantId)
          if (!applicant) return null

          return (
            <div
              key={application.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={applicant.avatar} />
                  <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${applicant.id}`} className="font-medium hover:underline">
                    {applicant.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{applicant.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={application.status === "pending" ? "outline" : application.status === "accepted" ? "default" : "destructive"}>
                      {application.status === "pending"
                        ? "Pendente"
                        : application.status === "accepted"
                          ? "Aceito"
                          : "Recusado"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(application.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {application.status === "pending" && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleUpdateStatus(application.id, "accepted")}
                    disabled={loading === application.id}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleUpdateStatus(application.id, "rejected")}
                    disabled={loading === application.id}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
