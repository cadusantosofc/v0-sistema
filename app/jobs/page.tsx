"use client"

import { useState } from "react"
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

export default function JobsPage() {
  const { user } = useAuth()
  const { getActiveJobs, applyToJob, applications } = useJobs()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applicationMessage, setApplicationMessage] = useState("")

  // Get only active jobs (not accepted by both parties)
  const activeJobs = getActiveJobs()

  // Filter jobs based on search criteria
  const filteredJobs = activeJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter
    const matchesType = typeFilter === "all" || job.type === typeFilter
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesCategory && matchesType && matchesLocation
  })

  const handleApply = (jobId: string) => {
    if (!user || user.role !== "worker") return

    const job = filteredJobs.find((j) => j.id === jobId)
    if (!job) return

    const success = applyToJob(jobId, user.id, user.name, user.avatar, applicationMessage)
    if (success) {
      // Create notification manually
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      notifications.push({
        id: Date.now().toString(),
        userId: job.companyId,
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

          return (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={job.companyLogo || "/placeholder.svg"} alt={job.companyName} />
                      <AvatarFallback>
                        <Building className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(job.createdAt).toLocaleDateString("pt-BR")}
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
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <Badge key={index} variant="outline">
                        {req}
                      </Badge>
                    ))}
                    {job.requirements.length > 3 && (
                      <Badge variant="outline">+{job.requirements.length - 3} mais</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">R$ {job.salary.toLocaleString("pt-BR")}</span>
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
                              <DialogDescription>Envie sua candidatura para {job.companyName}</DialogDescription>
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
