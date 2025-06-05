"use client"

import React from "react"
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
  Eye,
  Edit,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useChat } from "@/lib/chat-context"
import { Balance } from "@/components/wallet/balance"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const { getAllJobs } = useJobs()
  
  // Obter todas as vagas
  const allJobs = getAllJobs()
  
  // Filtrar apenas vagas com status 'open', 'active' ou 'published'
  const activeJobs = allJobs.filter(job => {
    const status = job.status?.toLowerCase() || '';
    return ['open', 'active', 'published'].includes(status);
  });
  
  // Ordenar as vagas ativas por data de criação (mais recentes primeiro)
  const latestJobs = activeJobs
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at).getTime();
      const dateB = new Date(b.createdAt || b.created_at).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

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
                      <span>{new Date(job.created_at || job.createdAt).toLocaleDateString("pt-BR")}</span>
                      <span>
                        {new Date(job.created_at || job.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {job.salary_range ? `R$ ${job.salary_range}` : 'A combinar'}
                    </p>
                    <Badge variant="default">
                      {job.status === "active" || job.status === "open" ? "Ativa" : 
                       job.status === "in_progress" ? "Em andamento" : 
                       job.status === "completed" ? "Concluída" : 
                       job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.type === 'full_time' ? 'Tempo integral' :
                       job.type === 'part_time' ? 'Meio período' :
                       job.type === 'contract' ? 'Contrato' :
                       job.type === 'internship' ? 'Estágio' : job.type}
                    </p>
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
  if (!user) return null

  const userApplications = getApplicationsByWorker(user.id)
  const completedJobs = getCompletedJobsByWorker(user.id)
  const userChats = getUserChats(user.id)
  const jobStats = getJobStats(user.id, "worker")

  // Calculate average rating
  const averageRating = 4.5 // Default rating

  // Calculate monthly income
  const monthlyIncome = 0 // TODO: Implementar cálculo de renda mensal usando novo sistema

  // Recent Applications (WorkerDashboard)
  const recentApplications = applications; // Mostra todas as candidaturas, sem filtro de status

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
            <Balance userId={user.id} className="text-2xl font-bold text-green-600" />
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
              {recentApplications.map((application) => {
                const job = jobs.find((j) => j.id === (application.jobId || application.job_id));
                if (!job) return null;
                return (
                  <Link key={application.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-blue-600 hover:text-blue-800">{job.title}</h4>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">{job.companyName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(application.appliedAt || application.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {job.salary ? job.salary.toFixed(2) : job.payment_amount ? job.payment_amount.toFixed(2) : '0.00'}</p>
                        <Badge
                          variant={
                            application.status === "completed"
                              ? "default"
                              : application.status === "active"
                                ? "default"
                                : application.status === "pending"
                                  ? "secondary"
                                  : application.status === "accepted_by_company"
                                    ? "warning"
                                    : application.status === "cancelled"
                                      ? "destructive"
                                      : application.status === "rejected"
                                        ? "destructive"
                                        : "outline"
                          }
                        >
                          {application.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {application.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {application.status === "rejected" && <X className="h-3 w-3 mr-1" />}
                          {application.status === "cancelled" && <X className="h-3 w-3 mr-1" />}
                          {application.status === "pending"
                            ? "Pendente"
                            : application.status === "accepted_by_company"
                              ? "Aceito pela empresa"
                              : application.status === "active"
                                ? "Ativo"
                                : application.status === "completed"
                                  ? "Concluído"
                                  : application.status === "cancelled"
                                    ? "Cancelada"
                                    : application.status === "rejected"
                                      ? "Recusada"
                                      : application.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {recentApplications.length === 0 && (
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
  const [companyJobs, setCompanyJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  // Função para carregar vagas da empresa
  const loadCompanyJobs = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const jobs = await getJobsByCompany(user.id);
      setCompanyJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.error('Erro ao carregar vagas da empresa:', err);
      setError('Erro ao carregar vagas');
      setCompanyJobs([]);
    } finally {
      setLoading(false);
    }
  }, [user, getJobsByCompany]);

  // Efeito para verificar parâmetros na URL
  React.useEffect(() => {
    // Verificar se há um parâmetro de job_deleted na URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobDeleted = urlParams.get('job_deleted') === 'true';
    const errorParam = urlParams.get('error');
    
    if (jobDeleted) {
      // Limpar o parâmetro da URL sem recarregar a página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Mostrar mensagem de sucesso
      setSuccessMessage('Vaga excluída com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Recarregar vagas
      loadCompanyJobs();
    }
    
    if (errorParam === 'job-not-found') {
      // Limpar o parâmetro da URL sem recarregar a página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Mostrar mensagem de erro
      setError('A vaga que você tentou acessar não existe mais.');
      setTimeout(() => setError(null), 5000);
    }
  }, [loadCompanyJobs]);

  // Efeito para carregar vagas inicialmente
  React.useEffect(() => {
    loadCompanyJobs();
  }, [loadCompanyJobs]);

  if (!user) return null;

  const jobStats = getJobStats(user.id, "company");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Get applications for company jobs
  const companyApplications = applications.filter((app) => companyJobs.some((job) => job.id === app.jobId));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Empresa</h1>
        <p className="text-gray-600">Gerencie suas vagas e candidatos, {user.name}.</p>
      </div>

      {successMessage && (
        <Alert className="mb-6">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Balance userId={user.id} className="text-2xl font-bold text-blue-600" />
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
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-muted-foreground">Avaliação dos profissionais</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Minhas Vagas</h2>
          <Link href="/post-job">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova vaga
            </Button>
          </Link>
        </div>

        {companyJobs.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Nenhuma vaga publicada</h3>
                <p className="mt-1 text-gray-500">Comece criando sua primeira vaga</p>
                <div className="mt-6">
                  <Link href="/post-job">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar nova vaga
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {companyJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.location}</CardDescription>
                    </div>
                    <Badge variant={
                      job.status === 'open' ? 'outline' : 
                      job.status === 'in_progress' ? 'secondary' : 
                      job.status === 'completed' ? 'default' : 
                      'destructive'
                    }>
                      {job.status === 'open' ? 'Aberta' : 
                       job.status === 'in_progress' ? 'Em andamento' : 
                       job.status === 'completed' ? 'Concluída' : 
                       job.status === 'cancelled' ? 'Cancelada' : 
                       'Fechada'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-500">Salário:</div>
                    <div className="font-medium">R$ {job.salary ? job.salary.toFixed(2) : job.payment_amount ? job.payment_amount.toFixed(2) : '0.00'}</div>
                  </div>
                  <div className="flex justify-between mb-4">
                    <div className="text-sm text-gray-500">Candidaturas:</div>
                    <div className="font-medium">
                      {applications.filter(app => app.jobId === job.id).length}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </Link>
                    {job.status === 'open' && (
                      <Link href={`/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Candidaturas Recentes</h2>
        {companyApplications.length > 0 ? (
          <div className="space-y-4">
            {companyApplications.slice(0, 5).map((app) => {
              const job = companyJobs.find((j) => j.id === app.jobId);
              if (!job) return null;
              
              return (
                <Card key={app.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-gray-500">
                          Candidato: {app.workerName || "Nome não disponível"}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge
                          variant={
                            app.status === 'pending' ? 'outline' : 
                            app.status === 'accepted_by_company' ? 'secondary' : 
                            app.status === 'active' ? 'default' : 
                            'destructive'
                          }
                        >
                          {app.status === 'pending' ? 'Pendente' : 
                           app.status === 'accepted_by_company' ? 'Aceito por você' : 
                           app.status === 'active' ? 'Em andamento' : 
                           app.status === 'completed' ? 'Concluído' : 
                           'Rejeitado'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-gray-500">Nenhuma candidatura recebida ainda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const { jobs } = useJobs()
  const { getAllUsers } = useAuth()
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadUsers() {
      try {
        const allUsers = await getAllUsers()
        setUsers(allUsers || [])
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  if (!user) return null

  // Mostra loading enquanto os usuários não foram carregados
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Carregando dados...</p>
      </div>
    )
  }

  const companies = users.filter((u) => u.role === "company")
  const workers = users.filter((u) => u.role === "worker")
  const totalWallet = users.reduce((sum, u) => sum + (u.wallet || 0), 0)

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
            <div className="text-2xl font-bold">{users.length}</div>
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
            <div className="text-2xl font-bold">R$ {totalWallet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Total em carteiras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Publicadas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{jobs?.filter((j) => j.status === "active")?.length || 0} ativas</p>
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
                // TODO: Implementar histórico de transações usando novo sistema
                {
                  action: "Sistema atualizado",
                  details: "O sistema de carteira foi atualizado",
                  time: new Date().toLocaleString("pt-BR"),
                  type: "info",
                }
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
