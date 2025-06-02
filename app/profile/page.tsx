"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Building, Camera, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Balance } from "@/components/wallet/balance"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    category: "",
    document: "",
    avatar: "",
  })

  // Atualiza formData quando user mudar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        category: user.category || "",
        document: user.document || "",
        avatar: user.avatar || "",
      })
    }
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          Você precisa estar logado para acessar seu perfil
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    setSuccess("")

    try {
      // Atualiza o perfil via API
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        })
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar perfil")
      }

      const { user: updatedUser } = await response.json()
      updateProfile(updatedUser)
      setSuccess("Perfil atualizado com sucesso!")
      setIsEditing(false)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || "",
      category: user.category || "",
      document: user.document || "",
      avatar: user.avatar || "",
    })
    setIsEditing(false)
    setSuccess("")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Picture & Basic Info */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar || user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setFormData(prev => ({
                          ...prev,
                          avatar: reader.result as string
                        }))
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <label htmlFor="avatar-upload">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    type="button"
                    asChild
                  >
                    <div>
                      <Camera className="h-4 w-4" />
                    </div>
                  </Button>
                </label>
              </div>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              {user.role === "company" ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
              {user.name}
            </CardTitle>
            <CardDescription>
              {user.role === "admin" ? "Administrador" : user.role === "company" ? "Empresa" : "Profissional"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600">Saldo disponível</p>
              <div className="flex justify-center">
                <Balance userId={user.id} className="text-2xl font-bold text-green-600" />
              </div>
            </div>

            {user.role === "worker" && (
              <div className="text-center">
                <div className="text-lg font-semibold">4.8 ⭐</div>
                <p className="text-sm text-gray-600">Avaliação média</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados pessoais</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Editar</Button>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{user.role === "company" ? "Nome da Empresa" : "Nome Completo"}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">{user.role === "company" ? "CNPJ" : "CPF"}</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {user.role === "worker" && (
              <div className="space-y-2">
                <Label htmlFor="category">Área de Atuação</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">{user.role === "company" ? "Sobre a Empresa" : "Sobre Você"}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
                placeholder={
                  user.role === "company"
                    ? "Descreva sua empresa, área de atuação e valores..."
                    : "Conte sobre sua experiência, habilidades e objetivos profissionais..."
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Workers */}
      {user.role === "worker" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>Seu desempenho na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">28</div>
                <p className="text-sm text-gray-600">Trabalhos Concluídos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4.8</div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <p className="text-sm text-gray-600">Taxa de Aprovação</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <p className="text-sm text-gray-600">Candidaturas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
