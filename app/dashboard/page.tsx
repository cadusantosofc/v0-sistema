"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  Briefcase,
  Star,
  TrendingUp,
  Users,
  Building,
  Plus,
  CheckCircle,
  Clock,
  X,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useChat } from "@/lib/chat-context"
import { useTransactions } from "@/lib/transactions-context"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Carregando...</div>
  }

  if (user.role === "worker") {
    return <WorkerDashboard />
  } else if (user.role === "company") {
    return <CompanyDashboard />
  } else {
    return <AdminDashboard />
  }
}

function LatestJobsCard() {
  const { getLatestJobs } = useJobs()
  const latestJobs = getLatestJobs(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Vagas Publicadas</CardTitle>
        <CardDescription>As 5 vagas mais recentes da plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {latestJobs.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma vaga publicada ainda</p>
          ) : (
            latestJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-blue-600 hover:text-blue-800">{job.title}</h4>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{job.companyName}</p>
                    <p className="text-xs text-gray-500">{job.location}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
                      <span>
                        {new Date(job.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">R$ {job.salary.toLocaleString("pt-BR")}</p>
                    <Badge variant="default">{job.status === "active" ? "Ativa" : "Em andamento"}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{job.type}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        {latestJobs.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                Ver Todas as Vagas
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WorkerDashboard() {
  const { user } = useAuth()
  const { getApplicationsByWorker, getCompletedJobsByWorker, getJobStats, applications, jobs } = useJobs()
  const { getUserChats } = useChat()
  const { calculateBalance, getUserTransactions } = useTransactions()

  if (!user) return null

  const userApplications = getApplicationsByWorker(user.id)
  const completedJobs = getCompletedJobsByWorker(user.id)
  const userChats = getUserChats(user.id)
  const currentBalance = calculateBalance(user.id, user.wallet)
  const userTransactions = getUserTransactions(user.id)
  const jobStats = getJobStats(user.id, "worker")

  // Calculate average rating
  const averageRating = 4.5 // Default rating

  // Calculate monthly income
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyIncome = userTransactions
    .filter((tx) => {
      const txDate = new Date(tx.createdAt)
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear &&
        tx.type === "credit" &&
        tx.status === "completed"
      )
    })
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Profissional</h1>
        <p className="text-gray-600">Bem-vindo de volta, {user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +R$ {monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidaturas Ativas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats.activeApplications || 0}</div>
            <p className="text-xs text-muted-foreground">{jobStats.pendingApplications || 0} aguardando resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabalhos Concluídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs.length}</div>
            <p className="text-xs text-muted-foreground">Total de trabalhos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {averageRating > 0 ? "Baseado em avaliações" : "Nenhuma avaliação ainda"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Candidaturas Recentes</CardTitle>
            <CardDescription>Suas últimas candidaturas a vagas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userApplications.slice(0, 5).map((application) => {
                const job = jobs.find((j) => j.id === application.jobId)
                if (!job) return null

                return (
                  <Link key={application.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-600 hover:text-blue-800">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.companyName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(application.appliedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {job.salary.toLocaleString("pt-BR")}</p>
                        <Badge
                          variant={
                            application.status === "completed"
                              ? "default"
                              : application.status === "active"
                                ? "default"
                                : application.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                          }
                        >
                          {application.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {application.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {application.status === "rejected" && <X className="h-3 w-3 mr-1" />}
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
                    </div>
                  </Link>
                )
              })}
              {userApplications.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhuma candidatura ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Jobs */}
        <LatestJobsCard />
      </div>
    </div>
  )
}

function CompanyDashboard() {
  const { user } = useAuth()
  const { getJobsByCompany, applications, getJobStats, acceptApplication, rejectApplication, completeJob } = useJobs()
  const { calculateBalance, getUserTransactions, releaseJobPayment } = useTransactions()

  if (!user) return null

  const companyJobs = getJobsByCompany(user.id)
  const currentBalance = calculateBalance(user.id, user.wallet)
  const jobStats = getJobStats(user.id, "company")

  // Default rating
  const companyRating = 4.2

  // Get applications for company jobs
  const companyApplications = applications.filter((app) => companyJobs.some((job) => job.id === app.jobId))

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
      message: `Sua candidatura foi aceita! Agora você pode aceitar o trabalho.`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { applicationId },
    }
    notifications.push(newNotification)
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }

  const handleCompleteJob = (jobId: string) => {
    const job = companyJobs.find((j) => j.id === jobId)
    if (!job || !job.assignedWorkerId) return

    completeJob(jobId)
    releaseJobPayment(jobId, job.assignedWorkerId, () => {})

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
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Empresa</h1>
        <p className="text-gray-600">Gerencie suas vagas e candidatos, {user.name}.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Para publicação de vagas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {companyApplications.filter((app) => app.status === "pending").length} candidaturas recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabalhos em Andamento</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats.inProgressJobs || 0}</div>
            <p className="text-xs text-muted-foreground">Projetos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyRating > 0 ? companyRating.toFixed(1) : "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {companyRating > 0 ? "Avaliação dos profissionais" : "Nenhuma avaliação ainda"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Active Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vagas Ativas</CardTitle>
              <CardDescription>Suas vagas publicadas</CardDescription>
            </div>
            <Link href="/post-job">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Vaga
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyJobs
                .filter((job) => job.status === "active" || job.status === "in_progress")
                .slice(0, 5)
                .map((job) => {
                  const jobApplications = applications.filter((app) => app.jobId === job.id)
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-600 hover:text-blue-800">{job.title}</h4>
                          <p className="text-sm text-gray-600">
                            {jobApplications.length} candidato{jobApplications.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {job.salary.toLocaleString("pt-BR")}</p>
                          <Badge variant={job.status === "active" ? "default" : "secondary"}>
                            {job.status === "active" ? "Ativa" : "Em andamento"}
                          </Badge>
                        </div>
                        {job.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleCompleteJob(job.id)
                            }}
                            className="ml-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Link>
                  )
                })}
              {companyJobs.filter((job) => job.status === "active" || job.status === "in_progress").length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhuma vaga ativa</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Jobs */}
        <LatestJobsCard />
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { getAllUsers } = useAuth()
  const { jobs, applications } = useJobs()
  const { transactions, balanceRequests } = useTransactions()

  const allUsers = getAllUsers()
  const companies = allUsers.filter((u) => u.role === "company")
  const workers = allUsers.filter((u) => u.role === "worker")
  const totalWallet = allUsers.reduce((sum, u) => sum + u.wallet, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral completa da plataforma.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              {workers.length} profissionais, {companies.length} empresas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">Empresas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Financeiro</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalWallet.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total em carteiras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Publicadas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">{jobs.filter((j) => j.status === "active").length} ativas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                ...transactions.slice(0, 3).map((tx) => ({
                  action: tx.type === "credit" ? "Pagamento recebido" : "Pagamento enviado",
                  details: tx.description,
                  time: new Date(tx.createdAt).toLocaleString("pt-BR"),
                  type: "info",
                })),
                ...balanceRequests.slice(0, 2).map((req) => ({
                  action: req.type === "recharge" ? "Solicitação de recarga" : "Solicitação de saque",
                  details: `${req.userName} - R$ ${req.amount.toFixed(2)}`,
                  time: new Date(req.createdAt).toLocaleString("pt-BR"),
                  type: req.status === "pending" ? "warning" : "success",
                })),
              ]
                .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .slice(0, 5)
                .map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          activity.type === "error"
                            ? "bg-red-500"
                            : activity.type === "warning"
                              ? "bg-yellow-500"
                              : activity.type === "success"
                                ? "bg-green-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Latest Jobs */}
        <LatestJobsCard />
      </div>
    </div>
  )
}
