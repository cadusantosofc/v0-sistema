"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Briefcase, Users, Eye, Edit, Trash2, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useTransactions } from "@/lib/transactions-context"
import { useRouter } from "next/navigation"

export default function MyJobsPage() {
  const { user, updateWallet } = useAuth()
  const { getJobsByCompany, applications, completeJob, cancelJob } = useJobs()
  const { cancelJobPayment, releaseJobPayment } = useTransactions()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [success, setSuccess] = useState("")

  if (!user || user.role !== "company") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Acesso negado. Apenas empresas podem acessar esta página.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const companyJobs = getJobsByCompany(user.id)

  // Filter jobs by status
  const filteredJobs = companyJobs.filter((job) => {
    if (statusFilter === "all") return true
    return job.status === statusFilter
  })

  const handleDeleteJob = (jobId: string) => {
    const job = companyJobs.find((j) => j.id === jobId)
    if (!job) return

    if (job.status === "in_progress" || job.status === "completed") {
      alert("Não é possível excluir vagas em andamento ou concluídas.")
      return
    }

    if (confirm("Tem certeza que deseja excluir esta vaga? O saldo será devolvido.")) {
      cancelJob(jobId)
      cancelJobPayment(jobId, updateWallet)
      setSuccess("Vaga excluída com sucesso! Saldo devolvido.")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleCompleteJob = (jobId: string) => {
    const job = companyJobs.find((j) => j.id === jobId)
    if (!job || !job.assignedWorkerId) return

    if (confirm("Tem certeza que deseja marcar este trabalho como concluído?")) {
      completeJob(jobId)
      releaseJobPayment(jobId, job.assignedWorkerId, updateWallet)

      // Add notification manually
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      const newNotification = {
        id: Date.now().toString(),
        userId: job.assignedWorkerId,
        type: "payment",
        title: "Trabalho Concluído!",
        message: `O pagamento de R$ ${job.salary.toFixed(2)} foi liberado para sua carteira.`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { jobId },
      }
      notifications.push(newNotification)
      localStorage.setItem("notifications", JSON.stringify(notifications))

      setSuccess("Trabalho marcado como concluído! Pagamento liberado.")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Ativa</Badge>
      case "in_progress":
        return <Badge variant="secondary">Em Andamento</Badge>
      case "completed":
        return <Badge variant="outline">Concluída</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getJobApplicationsCount = (jobId: string) => {
    return applications.filter((app) => app.jobId === jobId).length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Vagas</h1>
          <p className="text-gray-600">Gerencie todas as vagas da sua empresa</p>
        </div>
        <Button onClick={() => router.push("/post-job")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
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
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === "all"
                  ? "Você ainda não publicou nenhuma vaga."
                  : `Nenhuma vaga com status "${statusFilter}" encontrada.`}
              </p>
              <Button onClick={() => router.push("/post-job")}>
                <Plus className="h-4 w-4 mr-2" />
                Publicar Primeira Vaga
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => {
            const applicationsCount = getJobApplicationsCount(job.id)

            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                          {job.title}
                        </h3>
                        {getStatusBadge(job.status)}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Localização:</strong> {job.location}
                        </p>
                        <p>
                          <strong>Modalidade:</strong>{" "}
                          {job.type === "remote" ? "Remoto" : job.type === "presencial" ? "Presencial" : "Freelance"}
                        </p>
                        <p>
                          <strong>Categoria:</strong> {job.category}
                        </p>
                        <p>
                          <strong>Salário:</strong> R$ {job.salary.toLocaleString("pt-BR")}
                        </p>
                        <p>
                          <strong>Publicada em:</strong> {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                        {job.assignedWorkerName && (
                          <p>
                            <strong>Profissional:</strong> {job.assignedWorkerName}
                          </p>
                        )}
                        {job.completedAt && (
                          <p>
                            <strong>Concluída em:</strong> {new Date(job.completedAt).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mt-3 line-clamp-2">{job.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${job.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>

                      {job.status === "active" && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </>
                      )}

                      {job.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteJob(job.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como Concluído
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>
                          {applicationsCount} candidato{applicationsCount !== 1 ? "s" : ""}
                        </span>
                      </div>
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
          <CardDescription>Resumo das suas vagas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{companyJobs.length}</div>
              <p className="text-sm text-gray-600">Total de Vagas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {companyJobs.filter((job) => job.status === "active").length}
              </div>
              <p className="text-sm text-gray-600">Ativas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {companyJobs.filter((job) => job.status === "in_progress").length}
              </div>
              <p className="text-sm text-gray-600">Em Andamento</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {companyJobs.filter((job) => job.status === "completed").length}
              </div>
              <p className="text-sm text-gray-600">Concluídas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
