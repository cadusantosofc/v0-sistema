"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Clock, DollarSign, Building, Filter, Heart, Share2, Star, Send, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useRouter } from "next/navigation"
import { Job } from "@/lib/types/jobs"

export default function JobsPage() {
  const { user, getUserById } = useAuth()
  const { applyToJob, applications } = useJobs()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Record<string, any>>({})

  // Busca as vagas ativas da API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('Iniciando busca de vagas...')
        setLoading(true)
        const response = await fetch('/api/jobs')
        console.log('Resposta da API:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Erro na resposta da API:', errorText)
          throw new Error('Erro ao buscar vagas: ' + response.statusText)
        }
        
        const data = await response.json()
        console.log('Dados recebidos da API:', data)
        
        if (!Array.isArray(data)) {
          console.error('Dados recebidos não são um array:', data)
          throw new Error('Formato de dados inválido')
        }
        
        setActiveJobs(data)
        
        // Buscar informações das empresas
        const companyIds = [...new Set(data.map(job => job.company_id))]
        const companiesData: Record<string, any> = {}
        
        for (const companyId of companyIds) {
          if (companyId) {
            const companyData = await getUserById(companyId)
            if (companyData) {
              companiesData[companyId] = companyData
            }
          }
        }
        
        setCompanies(companiesData)
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar vagas:', err)
        setError(`Não foi possível carregar as vagas: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Filtra vagas com base nos critérios de busca
  const filteredJobs = activeJobs.filter((job) => {
    // Se a vaga está pendente, só mostra para empresa dona ou trabalhador com candidatura aceita/ativa
    if (job.status === 'pending') {
      if (!user) return false;
      if (user.id === job.company_id) return true;
      // Verifica se o usuário tem candidatura aceita ou ativa nessa vaga
      const userHasAccess = applications.some(
        (app) =>
          app.jobId === job.id &&
          app.workerId === user.id &&
          (app.status === 'accepted_by_company' || app.status === 'active')
      );
      return userHasAccess;
    }
    // Vagas normais
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter;
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesLocation = !locationFilter ||
      (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));
    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  const handleApply = async (jobId: string) => {
    if (!user || user.role !== "worker") return

    const job = filteredJobs.find((j) => j.id === jobId)
    if (!job) return

    try {
      const application = await applyToJob(user.id, jobId)
      if (application) {
        // Create notification manually
        const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
        notifications.push({
          id: Date.now().toString(),
          userId: job.company_id,
          type: "match",
          title: "Nova Candidatura",
          message: `${user.name} se candidatou para ${job.title}`,
          read: false,
          createdAt: new Date().toISOString(),
          data: { jobId, workerId: user.id },
        })
        localStorage.setItem("notifications", JSON.stringify(notifications))

        setSuccess("Candidatura enviada com sucesso!")
        setApplicationMessage("")
        setSelectedJob(null)
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleViewDetails = (jobId: string) => {
    router.push(`/jobs/${jobId}`)
  }

  const hasApplied = (jobId: string) => {
    return applications.some((app) => app.jobId === jobId && app.workerId === user?.id)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro ao carregar vagas:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vagas Disponíveis</h1>
        <p className="text-gray-600">Encontre oportunidades que combinam com seu perfil</p>
      </div>

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cargo, empresa ou palavra-chave"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="servicos">Serviços Gerais</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modalidade</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as modalidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  <SelectItem value="remote">Remoto</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cidade, estado"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredJobs.length} vaga{filteredJobs.length !== 1 ? "s" : ""} encontrada
          {filteredJobs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.map((job) => {
          const companyRating = 4.5 // Default rating
          const companyData = companies[job.company_id]
          // Verificar se temos dados da empresa e se tem nome
          const companyName = companyData?.name || "Empresa"
          const companyAvatar = companyData?.avatar || companyData?.logo || "/placeholder.svg"

          return (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={companyAvatar} alt={companyName} />
                      <AvatarFallback>
                        <Building className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary_range}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.type === "full_time" ? "Tempo integral" : 
                           job.type === "part_time" ? "Meio período" : 
                           job.type === "contract" ? "Contrato" : 
                           job.type === "internship" ? "Estágio" : job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {companyRating.toFixed(1)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.category}</Badge>
                    <Badge variant="outline">
                      {job.type === "remote" ? "Remoto" : job.type === "presencial" ? "Presencial" : "Freelance"}
                    </Badge>
                    {Array.isArray(job.requirements) 
                      ? job.requirements.slice(0, 3).map((req, index) => (
                          <Badge key={index} variant="outline" className="whitespace-nowrap">
                            {typeof req === 'string' ? req.trim() : JSON.stringify(req).trim()}
                          </Badge>
                        ))
                      : (typeof job.requirements === 'string' ? job.requirements.split(',') : [])
                          .slice(0, 3)
                          .map((req, index) => (
                            <Badge key={index} variant="outline" className="whitespace-nowrap">
                              {req.trim()}
                            </Badge>
                          ))
                    }
                    {((Array.isArray(job.requirements) 
                      ? job.requirements.length 
                      : (typeof job.requirements === 'string' ? job.requirements.split(',').length : 0)) > 3) && (
                      <Badge variant="outline">
                        +{
                          (Array.isArray(job.requirements) 
                            ? job.requirements.length 
                            : (typeof job.requirements === 'string' ? job.requirements.split(',').length : 0)) - 3
                        } mais
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        {job.salary_range ? `R$ ${job.salary_range}` : 'A combinar'}
                      </span>
                    </div>

                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => handleViewDetails(job.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>

                      {user.role === "worker" && !hasApplied(job.id) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>Candidatar-se</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Candidatar-se para {job.title}</DialogTitle>
                              <DialogDescription>Envie sua candidatura para {companyName}</DialogDescription>
                            </DialogHeader>
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
                              <Button onClick={() => handleApply(job.id)} className="w-full">
                                <Send className="h-4 w-4 mr-2" />
                                Enviar Candidatura
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {user.role === "worker" && hasApplied(job.id) && (
                        <Badge variant="default">Candidatura Enviada</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca ou remover alguns critérios.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
