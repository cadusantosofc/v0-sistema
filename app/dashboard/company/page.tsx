"use client"

import { useState, useEffect } from "react"
import { Balance } from "@/components/wallet/balance"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Job } from "@/lib/types/jobs"
import { Badge } from "@/components/ui/badge"
import { Eye, MapPin, DollarSign, Calendar } from "lucide-react"

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [jobsInProgress, setJobsInProgress] = useState<Job[]>([])
  const [totalCandidatures, setTotalCandidatures] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return
      
      // Log do usuário para debug
      console.log('Usuário logado:', user)
      console.log('ID do usuário:', user.id)
      
      try {
        setLoading(true)
        // Buscar vagas da empresa logada
        console.log(`Buscando vagas para company_id: ${user.id}`)
        const response = await fetch(`/api/jobs?companyId=${user.id}`)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar vagas')
        }
        
        const data = await response.json()
        
        // Log para depuração
        console.log('Vagas encontradas:', data)
        console.log('Dados das vagas:', data.map((job: Job) => ({
          id: job.id,
          title: job.title,
          status: job.status,
          company_id: job.company_id
        })))
        
        // Verificar primeiro se todas as vagas pertencem a esta empresa
        const companyJobs = data.filter((job: Job) => 
          job.company_id && job.company_id.toString() === user.id.toString()
        );
        
        console.log(`Vagas filtradas pela empresa (${user.id}):`, companyJobs.length);
        
        // Filtrar apenas vagas com status ativo (open, active, published)
        // Mesmo critério utilizado na API em listOpenJobs
        const activeStatuses = ['open', 'active', 'published', 'Open', 'Active', 'Published'];
        const openJobs = companyJobs.filter((job: Job) => {
          if (!job.status) return true; // Se não tiver status, considerar como ativa
          
          // Verificação case insensitive
          const jobStatus = job.status.toLowerCase();
          return activeStatuses.some(status => status.toLowerCase() === jobStatus);
        });
        
        console.log('Vagas consideradas ativas:', openJobs)
        setActiveJobs(openJobs)
        
        // Filtrar vagas em andamento
        const jobsInProgress = data.filter((job: Job) => job.status === "in_progress")
        setJobsInProgress(jobsInProgress)
        
        // Buscar candidaturas para estas vagas
        const jobIds = openJobs.map((job: Job) => job.id)
        
        if (jobIds.length > 0) {
          const applicationsResponse = await fetch(`/api/applications?jobIds=${jobIds.join(',')}`)
          if (applicationsResponse.ok) {
            const applications = await applicationsResponse.json()
            setTotalCandidatures(applications.length)
          }
        }
        
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar vagas:', err)
        setError('Não foi possível carregar suas vagas')
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [user])

  if (!user) {
    return <div className="container py-6">Carregando...</div>
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard Empresa</h1>
        <p className="text-muted-foreground">
          Gerencie suas vagas e candidatos, {user.name}.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card de Saldo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              R$ {user.wallet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Para publicação de vagas
            </p>
          </CardContent>
        </Card>

        {/* Card de Vagas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vagas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeJobs.length}</p>
            <p className="text-xs text-muted-foreground">
              {totalCandidatures} candidaturas recebidas
            </p>
          </CardContent>
        </Card>

        {/* Card de Trabalhos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trabalhos em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{jobsInProgress.length}</p>
            <p className="text-xs text-muted-foreground">
              Projetos ativos
            </p>
          </CardContent>
        </Card>

        {/* Card de Avaliação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avaliação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4.2</p>
            <p className="text-xs text-muted-foreground">
              Avaliação dos profissionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vagas Ativas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Suas Vagas Ativas</h2>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : !activeJobs || activeJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">Não encontramos vagas ativas associadas à sua conta</p>
              <p className="text-sm text-gray-500 mb-4">
                Se você acabou de publicar uma vaga, pode ser necessário aguardar alguns instantes para que ela apareça aqui.
              </p>
              <Button asChild>
                <Link href="/post-job">Publicar Nova Vaga</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{job.category || "Sem categoria"}</Badge>
                    <Badge variant="outline">
                      {job.type === "full_time" ? "Tempo integral" : 
                       job.type === "part_time" ? "Meio período" : 
                       job.type === "contract" ? "Contrato" : 
                       job.type === "internship" ? "Estágio" : job.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {job.location || "Localização não especificada"}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                      {job.salary_range ? `R$ ${job.salary_range}` : "A combinar"}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {job.created_at ? new Date(job.created_at).toLocaleDateString('pt-BR') : "Data não disponível"}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/post-job">Publicar Nova Vaga</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/wallet">Ver Carteira</Link>
        </Button>
      </div>
    </div>
  )
}
