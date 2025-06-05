"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, XCircle, Briefcase, Trash2, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useRouter } from "next/navigation"

export default function MyApplicationsPage() {
  const { user } = useAuth()
  const { getApplicationsByWorker, jobs, cancelApplication } = useJobs()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [success, setSuccess] = useState("")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (!user || user.role !== "worker") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Acesso negado. Apenas profissionais podem acessar esta página.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const userApplications = getApplicationsByWorker(user.id)

  // Filter applications by status
  const filteredApplications = userApplications.filter((app) => {
    if (statusFilter === "all") return true
    return app.status === statusFilter
  })

  const handleCancelApplication = (applicationId: string) => {
    if (confirm("Tem certeza que deseja cancelar esta candidatura?")) {
      const success = cancelApplication(applicationId)
      if (success) {
        setSuccess("Candidatura cancelada com sucesso!")
        setTimeout(() => setSuccess(""), 3000)
      }
    }
  }

  // PATCH para aceitar proposta
  const handleAcceptProposal = async (applicationId: string) => {
    setLoadingId(applicationId)
    try {
      await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: 'active' })
      })
      window.location.reload()
    } catch (e) {
      alert('Erro ao aceitar proposta')
    } finally {
      setLoadingId(null)
    }
  }

  // PATCH para recusar proposta
  const handleRejectProposal = async (applicationId: string) => {
    setLoadingId(applicationId)
    try {
      await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: 'rejected' })
      })
      window.location.reload()
    } catch (e) {
      alert('Erro ao recusar proposta')
    } finally {
      setLoadingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "accepted_by_company":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aceito pela empresa
          </Badge>
        )
      case "active":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Recusado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Minhas Candidaturas</h1>
        <p className="text-gray-600">Acompanhe o status de todas suas candidaturas</p>
      </div>

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="accepted_by_company">Aceito pela empresa</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="rejected">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma candidatura encontrada</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === "all"
                  ? "Você ainda não se candidatou a nenhuma vaga."
                  : `Nenhuma candidatura com status "${statusFilter}" encontrada.`}
              </p>
              <Button onClick={() => router.push("/jobs")}>Buscar Vagas</Button>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const job = jobs.find((j) => j.id === application.jobId)
            if (!job) return null

            return (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                          {job.title}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Empresa:</strong> {job.companyName}
                        </p>
                        <p>
                          <strong>Localização:</strong> {job.location}
                        </p>
                        <p>
                          <strong>Modalidade:</strong>{" "}
                          {job.type === "remote" ? "Remoto" : job.type === "presencial" ? "Presencial" : "Freelance"}
                        </p>
                        <p>
                          <strong>Salário:</strong> R$ {job.salary ? job.salary.toLocaleString("pt-BR") : job.payment_amount ? job.payment_amount.toLocaleString("pt-BR") : job.salary_range || '0,00'}
                        </p>
                        <p>
                          <strong>Candidatura enviada em:</strong>{" "}
                          {new Date(application.appliedAt).toLocaleDateString("pt-BR")}
                        </p>
                        {application.acceptedByCompanyAt && (
                          <p>
                            <strong>Aceito pela empresa em:</strong>{" "}
                            {new Date(application.acceptedByCompanyAt).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                        {application.acceptedByWorkerAt && (
                          <p>
                            <strong>Aceito por você em:</strong>{" "}
                            {new Date(application.acceptedByWorkerAt).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>

                      {application.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <strong>Sua mensagem:</strong> "{application.message}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${job.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Vaga
                      </Button>

                      {application.status === "pending" && (
                        <Button variant="destructive" size="sm" onClick={() => handleCancelApplication(application.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancelar Candidatura
                        </Button>
                      )}

                      {application.status === "accepted_by_company" && (
                        <>
                          <Button 
                            onClick={() => handleAcceptProposal(application.id)}
                            variant="success"
                            size="sm"
                            disabled={loadingId === application.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Aceitar Proposta
                          </Button>
                          <Button 
                            onClick={() => handleRejectProposal(application.id)}
                            variant="destructive"
                            size="sm"
                            disabled={loadingId === application.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Recusar Proposta
                          </Button>
                        </>
                      )}

                      {application.status === "pending_worker_confirmation" && (
                        <>
                          <Button 
                            onClick={() => handleAcceptProposal(application.id)}
                            variant="success"
                            size="sm"
                            disabled={loadingId === application.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Aceitar Proposta
                          </Button>
                          <Button 
                            onClick={() => handleRejectProposal(application.id)}
                            variant="destructive"
                            size="sm"
                            disabled={loadingId === application.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Recusar Proposta
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="text-right">
                      <Badge variant="outline">{job.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
          <CardDescription>Resumo das suas candidaturas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userApplications.length}</div>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {userApplications.filter((app) => app.status === "pending").length}
              </div>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userApplications.filter((app) => app.status === "accepted_by_company").length}
              </div>
              <p className="text-sm text-gray-600">Aceitas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userApplications.filter((app) => app.status === "active" || app.status === "completed").length}
              </div>
              <p className="text-sm text-gray-600">Trabalhos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {userApplications.filter((app) => app.status === "rejected").length}
              </div>
              <p className="text-sm text-gray-600">Recusadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
