"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, Mail, MapPin, Phone, Star, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: "admin" | "company" | "worker"
  location: string
  bio: string
  skills: string[]
  experience: string[]
  education: string[]
  rating: number
  totalJobs: number
  createdAt: string
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params.id])

  if (loading) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-[200px] bg-muted rounded" />
                  <div className="h-3 w-[150px] bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuário não encontrado</CardTitle>
            <CardDescription>
              O perfil que você está procurando não existe ou foi removido
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-1" />
                  {profile.role === "worker" ? "Profissional" : 
                   profile.role === "company" ? "Empresa" : "Administrador"}
                </CardDescription>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 mr-1 fill-primary text-primary" />
                  <span>{profile.rating.toFixed(1)}</span>
                  <span className="mx-1">•</span>
                  <span>{profile.totalJobs} trabalhos</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => window.location.href = `mailto:${profile.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              {profile.phone && (
                <Button variant="outline" onClick={() => window.location.href = `tel:${profile.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Sobre</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {profile.location}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Membro desde {formatDistanceToNow(new Date(profile.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>

          {profile.role === "worker" && (
            <>
              <div>
                <h3 className="font-medium mb-2">Habilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Experiência</h3>
                <ul className="space-y-4">
                  {profile.experience.map((exp, i) => (
                    <li key={i} className="flex items-start">
                      <Building2 className="h-4 w-4 mr-2 mt-1" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Educação</h3>
                <ul className="space-y-4">
                  {profile.education.map((edu, i) => (
                    <li key={i} className="flex items-start">
                      <Building2 className="h-4 w-4 mr-2 mt-1" />
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
