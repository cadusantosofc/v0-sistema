"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Clock,
  Building,
  Star,
  Send,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Trash2,
  Edit,
  Eye,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useTransactions } from "@/lib/transactions-context"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, getUserById, updateWallet } = useAuth()
  const { getJobById, applyToJob, applications, acceptJobByWorker, acceptApplication, rejectApplication, cancelJob } =
    useJobs()
  const { cancelJobPayment } = useTransactions()

  const [applicationMessage, setApplicationMessage] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const jobId = params.id as string
  const job = getJobById(jobId)

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Vaga não encontrada.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const company = getUserById(job.companyId)
  const userApplication = applications.find((app) => app.jobId === jobId && app.workerId === user?.id)
  const jobApplications = applications.filter((app) => app.jobId === jobId)

  // Mock data for company rating and reviews
  const companyRating = 4.5
  const companyReviews = [
    {
      id: "1",
      fromUserName: "Maria Silva",
      rating: 5,
      comment: "Excelente empresa para trabalhar, muito profissional!",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      fromUserName: "João Santos",
      rating: 4,
      comment: "Boa comunicação e pagamento em dia.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      fromUserName: "Ana Costa",
      rating: 5,
      comment: "Recomendo! Empresa séria e confiável.",
      createdAt: new Date().toISOString(),
    },
  ]

  const handleApply = () => {
    if (!user || user.role !== "worker") return

    const success = applyToJob(jobId, user.id, user.name, user.avatar, applicationMessage)
    if (success) {
      // Create notification manually
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      const newNotification = {
        id: Date.now().toString(),
        userId: job.companyId,
        type: "match",
        title: "Nova Candidatura",
        message: `${user.name} se candidatou para ${job.title}`,
        read: false,
        link: `/jobs/${jobId}`,
        createdAt: new Date().toISOString(),
        data: { jobId, workerId: user.id },
      }
      notifications.push(newNotification)
      localStorage.setItem("notifications", JSON.stringify(notifications))

      setSuccess("Candidatura enviada com sucesso!")
      setApplicationMessage("")
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError("Erro ao enviar candidatura. Você já se candidatou a esta vaga.")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleAcceptJob = () => {
    if (!userApplication || userApplication.status !== "accepted_by_company") return

    const success = acceptJobByWorker(userApplication.id)
    if (success) {
      // Create notification manually
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      const newNotification = {
        id: Date.now().toString(),
        userId: job.companyId,
        type: "match",
        title: "Trabalho Aceito!",
        message: `${user?.name} aceitou o trabalho: ${job.title}`,
        read: false,
        link: `/jobs/${jobId}`,
        createdAt: new Date().toISOString(),
        data: { jobId, workerId: user?.id },
      }
      notifications.push(newNotification)
      localStorage.setItem("notifications", JSON.stringify(notifications))

      setSuccess("Trabalho aceito! Você pode começar a trabalhar.")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleAcceptApplication = (applicationId: string) => {
    const application = applications.find((app) => app.id === applicationId)
    if (!application) return

    acceptApplication(applicationId)

    // Add notification manually
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const newNotification = {
      id: Date.now().toString(),
      userId: application.workerId,
      type: "match",
      title: "Candidatura Aceita!",
      message: `Sua candidatura para "${job.title}" foi aceita! Agora você pode aceitar o trabalho.`,
      read: false,
      link: `/jobs/${jobId}`,
      createdAt: new Date().toISOString(),
      data: { applicationId },
    }
    notifications.push(newNotification)
    localStorage.setItem("notifications", JSON.stringify(notifications))

    setSuccess("Candidatura aceita com sucesso!")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleRejectApplication = (applicationId: string) => {
    rejectApplication(applicationId)
    setSuccess("Candidatura recusada.")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleDeleteJob = () => {
    if (!user || (user.role !== "admin" && user.id !== job.companyId)) return
    if (job.status === "in_progress" || job.status === "completed") {
      setError("Não é possível excluir vagas em andamento ou concluídas.")
      return
    }

    if (confirm("Tem certeza que deseja excluir esta vaga? O saldo será devolvido.")) {
      cancelJob(jobId)
      cancelJobPayment(jobId, updateWallet)

      setSuccess("Vaga excluída com sucesso! Saldo devolvido.")
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }
  }

  const canDeleteJob = () => {
    if (!user) return false
    if (user.role === "admin") return true
    if (user.id === job.companyId && job.status === "active") return true
    return false
  }

  const canEditJob = () => {
    if (!user) return false
    if (user.role === "admin") return true
    if (user.id === job.companyId && job.status === "active") return true
    return false
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {canDeleteJob() && (
          <div className="flex gap-2">
            {canEditJob() && (
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleDeleteJob}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Vaga
            </Button>
          </div>
        )}
      </div>

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {job.companyName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    job.status === "active"
                      ? "default"
                      : job.status === "in_progress"
                        ? "secondary"
                        : job.status === "completed"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {job.status === "active"
                    ? "Ativa"
                    : job.status === "in_progress"
                      ? "Em Andamento"
                      : job.status === "completed"
                        ? "Concluída"
                        : "Cancelada"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-green-50 rounded-lg gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pagamento</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    R$ {job.salary.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modalidade</p>
                  <p className="font-medium">
                    {job.type === "remote" ? "Remoto" : job.type === "presencial" ? "Presencial" : "Freelance"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Descrição da Vaga</h3>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              {job.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Requisitos e Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <Badge key={index} variant="outline">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{job.category}</Badge>
                <Badge variant="outline">
                  {job.type === "remote" ? "Remoto" : job.type === "presencial" ? "Presencial" : "Freelance"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Section - Only for Company Owner and Admin */}
          {(user?.id === job.companyId || user?.role === "admin") && jobApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Candidatos ({jobApplications.length})</CardTitle>
                <CardDescription>Profissionais que se candidataram para esta vaga</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobApplications.map((application) => {
                    const candidate = getUserById(application.workerId)
                    return (
                      <div key={application.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={candidate?.avatar || "/placeholder.svg"} alt={candidate?.name} />
                              <AvatarFallback>
                                {candidate?.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{application.workerName}</h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{application.workerRating.toFixed(1)}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Candidatou-se em {new Date(application.appliedAt).toLocaleDateString("pt-BR")}
                              </p>
                              {application.message && (
                                <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                                  "{application.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              application.status === "pending"
                                ? "secondary"
                                : application.status === "accepted_by_company"
                                  ? "default"
                                  : application.status === "active"
                                    ? "default"
                                    : application.status === "completed"
                                      ? "outline"
                                      : "destructive"
                            }
                          >
                            {application.status === "pending"
                              ? "Pendente"
                              : application.status === "accepted_by_company"
                                ? "Aceito pela empresa"
                                : application.status === "active"
                                  ? "Ativo"
                                  : application.status === "completed"
                                    ? "Concluído"
                                    : "Recusado"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Perfil
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Perfil de {application.workerName}</DialogTitle>
                                <DialogDescription>Informações do candidato</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={candidate?.avatar || "/placeholder.svg"} alt={candidate?.name} />
                                    <AvatarFallback>
                                      {candidate?.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("") || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold">{candidate?.name}</h3>
                                    <p className="text-sm text-gray-600">{candidate?.category}</p>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span className="text-sm">{application.workerRating.toFixed(1)}</span>
                                    </div>
                                  </div>
                                </div>
                                {candidate?.bio && (
                                  <div>
                                    <h4 className="font-medium mb-2">Sobre</h4>
                                    <p className="text-sm text-gray-700">{candidate.bio}</p>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button onClick={() => router.push(`/profile/${candidate?.id}`)} className="w-full">
                                    Ver Perfil Completo
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {application.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptApplication(application.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aceitar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectApplication(application.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Recusar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Section */}
          {user?.role === "worker" && job.status === "active" && (
            <Card>
              <CardHeader>
                <CardTitle>Candidatar-se para esta vaga</CardTitle>
                <CardDescription>Envie sua candidatura e mostre por que você é o ideal</CardDescription>
              </CardHeader>
              <CardContent>
                {!userApplication ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mensagem para a empresa (opcional)</Label>
                      <Textarea
                        placeholder="Conte por que você é o candidato ideal para esta vaga..."
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleApply} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Candidatura
                    </Button>
                  </div>
                ) : userApplication.status === "pending" ? (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-medium mb-2">Candidatura Enviada</h3>
                    <p className="text-gray-600">Aguardando resposta da empresa</p>
                  </div>
                ) : userApplication.status === "accepted_by_company" ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium mb-2">Candidatura Aceita!</h3>
                    <p className="text-gray-600 mb-4">
                      A empresa aceitou sua candidatura. Aceite o trabalho para começar.
                    </p>
                    <Button onClick={handleAcceptJob} className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceitar Trabalho
                    </Button>
                  </div>
                ) : userApplication.status === "active" ? (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-lg font-medium mb-2">Trabalho Ativo</h3>
                    <p className="text-gray-600">Você está trabalhando nesta vaga</p>
                  </div>
                ) : userApplication.status === "completed" ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium mb-2">Trabalho Concluído</h3>
                    <p className="text-gray-600">Parabéns! Você concluiu este trabalho</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-medium mb-2">Candidatura Recusada</h3>
                    <p className="text-gray-600">Infelizmente sua candidatura não foi aceita</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Company Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={job.companyLogo || "/placeholder.svg"} alt={job.companyName} />
                  <AvatarFallback>
                    <Building className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{job.companyName}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm">{companyRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500 ml-1">({companyReviews.length} avaliações)</span>
                  </div>
                </div>
              </div>

              {company?.bio && (
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600">{company.bio}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Informações</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {company?.phone && <p>📞 {company.phone}</p>}
                  {company?.email && <p>✉️ {company.email}</p>}
                  <p>📅 Membro desde {new Date(company?.createdAt || "").toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{review.fromUserName}</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
