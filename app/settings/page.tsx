"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Bell, Shield, Save, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [success, setSuccess] = useState("")
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    paymentNotifications: true,

    // Privacy Settings
    profileVisibility: "public", // public, private, contacts
    showEmail: false,
    showPhone: false,

    // App Settings
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    theme: "light", // light, dark, auto

    // Company specific
    autoAcceptApplications: false,
    requireCoverLetter: true,

    // Worker specific
    jobAlerts: true,
    salaryRange: { min: 0, max: 50000 },
    availableForWork: true,
  })

  if (!user) {
    return <div>Carregando...</div>
  }

  const handleSave = () => {
    // In a real app, this would save to backend
    setSuccess("Configurações salvas com sucesso!")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleDeleteAccount = () => {
    if (confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
      // In a real app, this would delete the account
      alert("Funcionalidade de exclusão de conta seria implementada aqui")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600">Personalize sua experiência na plataforma</p>
      </div>

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure como você quer receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por E-mail</Label>
                <p className="text-sm text-gray-600">Receba atualizações importantes por e-mail</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações Push</Label>
                <p className="text-sm text-gray-600">Receba notificações no navegador</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Match</Label>
                <p className="text-sm text-gray-600">Quando alguém der match com você</p>
              </div>
              <Switch
                checked={settings.matchNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, matchNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Mensagem</Label>
                <p className="text-sm text-gray-600">Quando receber novas mensagens</p>
              </div>
              <Switch
                checked={settings.messageNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, messageNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Pagamento</Label>
                <p className="text-sm text-gray-600">Atualizações sobre pagamentos e saldo</p>
              </div>
              <Switch
                checked={settings.paymentNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, paymentNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacidade
            </CardTitle>
            <CardDescription>Controle quem pode ver suas informações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Visibilidade do Perfil</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value) => setSettings({ ...settings, profileVisibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público - Visível para todos</SelectItem>
                  <SelectItem value="private">Privado - Apenas você</SelectItem>
                  <SelectItem value="contacts">Contatos - Apenas conexões</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar E-mail no Perfil</Label>
                <p className="text-sm text-gray-600">Outros usuários poderão ver seu e-mail</p>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={(checked) => setSettings({ ...settings, showEmail: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar Telefone no Perfil</Label>
                <p className="text-sm text-gray-600">Outros usuários poderão ver seu telefone</p>
              </div>
              <Switch
                checked={settings.showPhone}
                onCheckedChange={(checked) => setSettings({ ...settings, showPhone: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Aplicativo
            </CardTitle>
            <CardDescription>Configurações gerais do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tema</Label>
              <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Role-specific Settings */}
        {user.role === "company" && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Empresa</CardTitle>
              <CardDescription>Configurações específicas para empresas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-aceitar Candidaturas</Label>
                  <p className="text-sm text-gray-600">Aceitar automaticamente candidatos qualificados</p>
                </div>
                <Switch
                  checked={settings.autoAcceptApplications}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoAcceptApplications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exigir Carta de Apresentação</Label>
                  <p className="text-sm text-gray-600">Candidatos devem enviar uma carta de apresentação</p>
                </div>
                <Switch
                  checked={settings.requireCoverLetter}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireCoverLetter: checked })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {user.role === "worker" && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Profissional</CardTitle>
              <CardDescription>Configurações específicas para profissionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Vagas</Label>
                  <p className="text-sm text-gray-600">Receber notificações de novas vagas</p>
                </div>
                <Switch
                  checked={settings.jobAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, jobAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Disponível para Trabalho</Label>
                  <p className="text-sm text-gray-600">Mostrar que está procurando oportunidades</p>
                </div>
                <Switch
                  checked={settings.availableForWork}
                  onCheckedChange={(checked) => setSettings({ ...settings, availableForWork: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Faixa Salarial Desejada</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Mínimo (R$)</Label>
                    <Input
                      type="number"
                      value={settings.salaryRange.min}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          salaryRange: { ...settings.salaryRange, min: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Máximo (R$)</Label>
                    <Input
                      type="number"
                      value={settings.salaryRange.max}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          salaryRange: { ...settings.salaryRange, max: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>Ações irreversíveis da conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-600 mb-2">Excluir Conta</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Uma vez excluída, sua conta não poderá ser recuperada. Todos os seus dados serão permanentemente
                  removidos.
                </p>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Conta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
