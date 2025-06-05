"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useWallet } from "@/hooks/use-wallet"

export default function PostJobPage() {
  const { user } = useAuth()
  const { createJob } = useJobs()
  const { balance, reloadBalance, updateBalance } = useWallet(user?.id || "")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  type JobType = 'full_time' | 'part_time' | 'contract' | 'internship';
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "servicos",
    location: "",
    type: "full_time" as JobType, // remote = full_time, presencial = part_time, freelance = contract
    payment_amount: "",
    requirements: [] as string[],
  })

  const jobCost = 10 // Taxa fixa (comissão) para publicar a vaga: R$10
  const currentBalance = balance
  const salaryValue = parseFloat(formData.payment_amount || "0")
  const totalCost = jobCost + salaryValue // Custo total: taxa fixa + valor da vaga

  // Atualiza o saldo ao carregar a página
  useEffect(() => {
    if (user?.id) {
      reloadBalance();
    }
  }, [user?.id, reloadBalance]);

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      })
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "servicos",
      location: "",
      type: "full_time" as JobType,
      payment_amount: "",
      requirements: []
    });
    setNewRequirement("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    console.log('Formulário submetido:', formData);

    // Cria uma cópia do formData para não alterar o estado original durante a validação
    const formDataCopy = { ...formData };

    if (!formDataCopy.category) {
      formDataCopy.category = "servicos";
    }

    // Melhorar a conversão do salário
    let salary = 0;
    try {
      // Garantir que estamos usando um número válido
      salary = formDataCopy.payment_amount ? Number.parseFloat(formDataCopy.payment_amount.toString().replace(',', '.')) : 0;
      console.log('Salário após conversão:', salary);
      
      // Se não for um número válido, considera como 0
      if (isNaN(salary)) {
        console.log('Salário inválido, usando 0');
        salary = 0;
      }
      
      // Atualizar no formDataCopy
      formDataCopy.payment_amount = salary.toString();
      
    } catch (e) {
      console.error('Erro ao converter salário:', e);
      formDataCopy.payment_amount = "0";
    }

    // Validação de campos obrigatórios
    const requiredFields = [
      { field: 'title', label: 'Título' },
      { field: 'description', label: 'Descrição' },
      { field: 'location', label: 'Localização' },
      { field: 'type', label: 'Tipo de trabalho' },
      { field: 'payment_amount', label: 'Faixa salarial' }
    ];

    // Adicionar logs para depuração
    console.log('Valores dos campos do formulário após processamento:');
    console.log('Título:', formDataCopy.title);
    console.log('Descrição:', formDataCopy.description);
    console.log('Localização:', formDataCopy.location);
    console.log('Tipo:', formDataCopy.type);
    console.log('Salário:', formDataCopy.payment_amount);

    // Verificar campos vazios com tratamento mais robusto
    const missingFields = requiredFields.filter(field => {
      const value = formDataCopy[field.field as keyof typeof formDataCopy];
      
      // Tratar cada tipo de campo de forma específica
      if (field.field === 'payment_amount') {
        // Para salário, verificar se é um número válido maior que zero
        const numValue = parseFloat(String(value).replace(',', '.'));
        console.log(`Verificando salário: ${value} -> ${numValue}`);
        // Permitimos salário zero (trabalho voluntário)
        return isNaN(numValue);
      } else {
        // Para outros campos, verificar se está vazio ou contém apenas espaços
        return !value || (typeof value === 'string' && value.trim() === '');
      }
    });

    if (missingFields.length > 0) {
      const errorMsg = `Por favor, preencha os seguintes campos obrigatórios: ${missingFields.map(f => f.label).join(', ')}`;
      console.error('Campos faltando:', missingFields);
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    // Atualizar o formData original com os valores corrigidos
    setFormData(formDataCopy);

    // Recalcular o custo total com o salário correto
    const updatedTotalCost = jobCost + salary;
    
    // Verifica saldo
    if (currentBalance < updatedTotalCost) {
      setError(`Saldo insuficiente. Você tem R$ ${currentBalance.toFixed(2)}, mas precisa de R$ ${updatedTotalCost.toFixed(2)} para publicar a vaga.`);
      setIsLoading(false);
      return;
    }

    try {
      // Prepara os dados
      if (!user) {
        setError("Usuário não autenticado.");
        setIsLoading(false);
        return;
      }
      const jobData = {
        ...formDataCopy,
        requirements: formDataCopy.requirements.join(", "),
        company_id: user.id,
        status: "open",
        payment_amount: Number(salary)
      };
      if ('salary' in jobData) {
        delete jobData.salary;
      }

      console.log('Enviando dados para API:', jobData);

      // Envia para a API
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData?.id) {
        let errorMsg = responseData?.error || 
                        `Erro ao criar vaga: ${response.status} ${response.statusText}`;
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      const jobId = responseData.id;
      console.log('Vaga criada com sucesso, ID:', jobId);

      setSuccess('Vaga publicada com sucesso! Redirecionando para o dashboard...');
      await reloadBalance();
      resetForm();
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao criar vaga:', error);
      setError(`Erro ao criar vaga: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificação de acesso movida para dentro do return
  if (!user || user.role !== "company") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Acesso negado. Apenas empresas podem publicar vagas.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Publicar Nova Vaga</h1>
        <p className="text-gray-600">Encontre o profissional ideal para sua empresa</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Wallet Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Seu saldo atual</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Custo total</p>
              <p className="text-xl font-bold text-blue-600">
                R$ {totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Publicação</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Como funciona:</strong> R$ {jobCost} de taxa fixa + R$ {salaryValue} (valor que você pagará ao profissional)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Vaga</CardTitle>
          <CardDescription>Preencha as informações da vaga que deseja publicar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Garçom para evento hoje"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de trabalho *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: JobType) => setFormData({ ...formData, type: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de trabalho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Remoto</SelectItem>
                    <SelectItem value="part_time">Presencial</SelectItem>
                    <SelectItem value="contract">Freelance</SelectItem>
                    <SelectItem value="internship">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_amount">Valor da Vaga *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-gray-600">R$</span>
                  <Input
                    id="payment_amount"
                    type="text"
                    placeholder="0,00"
                    value={formData.payment_amount}
                    onChange={(e) => {
                      // Permitir apenas números, vírgula e ponto
                      const rawValue = e.target.value;
                      const sanitizedValue = rawValue.replace(/[^\d.,]/g, '');
                      
                      // Converter vírgula para ponto (padrão internacional)
                      const normalizedValue = sanitizedValue.replace(',', '.');
                      
                      // Validar se é um número
                      const isValid = normalizedValue === '' || !isNaN(parseFloat(normalizedValue));
                      
                      if (isValid) {
                        setFormData({ ...formData, payment_amount: sanitizedValue });
                        console.log(`Campo de salário atualizado: ${sanitizedValue}`);
                      }
                    }}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  placeholder="Ex: São Paulo"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição da Vaga *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva as responsabilidades e requisitos do trabalho..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Requisitos *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      placeholder="Ex: Conhecimento em HTML"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRequirement}
                      disabled={isLoading || !newRequirement.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  {formData.requirements.map((requirement, index) => (
                    <div key={requirement} className="flex items-center gap-2">
                      <Badge>{requirement}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || currentBalance < totalCost}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    `Publicar Vaga (R$ ${totalCost.toFixed(2)})`
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
