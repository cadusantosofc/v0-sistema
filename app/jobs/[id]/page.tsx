"use client"

import { useState, useEffect, useMemo } from "react"
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
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Star,
  Tag,
  Trash2,
  User as UserIcon,
  Mail,
  Phone,
  Clock as ClockIcon,
  Check,
  X,
  AlertTriangle,
  XCircle,
  Send,
  Users
} from "lucide-react"

import { ReviewDialog } from "@/components/review-dialog"
import Link from "next/link"
import { toast } from "react-hot-toast"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dollar-sign': any;
      'briefcase': any;
      'tag': any;
    }
  }
}

import { useAuth } from "@/lib/auth-context"
import { useJobs } from "@/lib/jobs-context"
import { useTransactions } from "@/lib/transactions-context"
import { Job as BaseJob, Application as BaseApplication } from "@/lib/types/jobs"
import { useChat } from "@/lib/chat-context"

interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status: 'open' | 'closed' | 'draft' | 'in_progress' | 'completed' | 'active' | 'published';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // Para compatibilidade
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos opcionais para exibição
  companyName?: string;
  companyLogo?: string;
  company_description?: string;
  company_email?: string;
  company_phone?: string;
  company_created_at?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  logo?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}  // Adicione outras propriedades do usuário conforme necessário

// Use the imported BaseApplication type instead of redefining it

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, getUserById, updateWallet } = useAuth()
  const { getJobById, applyToJob, cancelApplication, applications, cancelJob, getJobApplications, completeJob } = useJobs()
  const { cancelJobPayment, releaseJobPayment } = useTransactions()
  const { createChat } = useChat()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [companyReviews, setCompanyReviews] = useState<any[]>([])
  const [companyRating, setCompanyRating] = useState(0)
  const [jobApplications, setJobApplications] = useState<any[]>([])

  const jobId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const jobData = await getJobById(jobId);
        if (!jobData) {
          router.push('/dashboard?error=job-not-found');
          return;
        }

        console.log('Dados da vaga recebidos:', jobData);
        
        // Verifica se temos um ID de empresa
        const companyId = jobData.company_id || jobData.companyId;
        if (companyId) {
          // Cria o objeto de empresa com os dados que já vieram na consulta
          const companyData = {
            id: companyId,
            name: (jobData as any).company_name || 'Empresa',
            email: (jobData as any).company_email || '',
            role: 'company',
            avatar: (jobData as any).company_logo || '/placeholder.svg',
            bio: (jobData as any).company_bio || 'Informações da empresa não disponíveis',
            phone: (jobData as any).company_phone || '',
            created_at: (jobData as any).company_created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as User;
          
          // Atualiza o estado com os dados da empresa
          setCompany(companyData);
          
          // Monta o objeto de job com os dados da empresa
          const jobWithCompany = {
            ...jobData,
            companyName: companyData.name,
            companyLogo: companyData.avatar,
            company_description: companyData.bio,
            company_email: companyData.email,
            company_phone: companyData.phone,
            company_created_at: companyData.created_at,
            companyId: companyId,
            company_id: companyId
          } as Job;
          
          setJob(jobWithCompany);
        } else {
          console.log('ID da empresa não encontrado na vaga, usando padrão');
          
          // Criar um objeto de empresa padrão quando não há ID
          const defaultCompany = {
            id: 'unknown',
            name: 'Empresa',
            email: '',
            role: 'company',
            avatar: '/placeholder.svg',
            bio: 'Informações da empresa não disponíveis',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as User;
          
          const jobWithDefaultCompany = {
            ...jobData,
            companyName: 'Empresa',
            companyLogo: '/placeholder.svg',
            company_description: 'Informações da empresa não disponíveis',
            company_email: '',
            company_phone: '',
            company_created_at: new Date().toISOString(),
            companyId: 'unknown',
            company_id: 'unknown'
          } as Job;
          
          setJob(jobWithDefaultCompany);
          setCompany(defaultCompany);
        }
        
        setIsLoadingCompany(false);
        
        // Busca as candidaturas se o usuário for o dono da vaga ou admin
        if (user?.id === jobData.company_id || user?.role === 'admin') {
          try {
            const applications = await getJobApplications(jobId);
            setJobApplications(applications);
          } catch (err) {
            console.error('Erro ao buscar candidaturas da vaga:', err);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados da vaga:', err);
        // Redireciona para o dashboard com uma mensagem de erro
        router.push('/dashboard?error=job-error');
      } finally {
        setLoading(false);
      }
    }
    if (jobId) {
      fetchJob();
    }
  }, [jobId, user?.id, user?.role]);

  // Valores padrão para evitar erros de undefined
  // Definindo os tipos de trabalho suportados
  type JobType = 'full_time' | 'part_time' | 'contract' | 'internship'
  const jobType: JobType = (job && ['full_time', 'part_time', 'contract', 'internship'].includes(job?.type as string) 
    ? job?.type as JobType 
    : 'full_time')
  const jobCategory = (job?.category as string) || 'Outros'
  const jobLocation = job?.location || 'Local não especificado'
  // Garantir que jobRequirements seja sempre um array de strings
  const jobRequirements: string[] = useMemo(() => {
    if (!job || !job.requirements) return [];
    if (typeof job.requirements === 'string') {
      return (job.requirements as string)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean) as string[];
    }
    if (Array.isArray(job.requirements)) {
      return (job.requirements as string[])
        .map((req: unknown) => String(req).trim())
        .filter(Boolean) as string[];
    }
    return [];
  }, [job])
  const jobDescription = job?.description || 'Sem descrição fornecida'
  // Garantir que sempre mostre o valor da vaga, mesmo que seja 0
  const jobSalary = job?.salary_range !== undefined && job?.salary_range !== null ? job.salary_range : '0';
  const salaryValue = `R$ ${jobSalary}`
  
  // Formatar a data para exibição
  const formattedDate = job?.created_at 
    ? new Date(job?.created_at).toLocaleDateString('pt-BR')
    : 'Data não disponível'

  const [company, setCompany] = useState<User | null>(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)
  
  const userApplication = useMemo(() => {
    // Primeiro verificamos nas aplicações que já carregamos
    if (Array.isArray(applications) && applications.length > 0) {
      const app = applications.find((app) => app.job_id === jobId && (app.user_id === user?.id || app.workerId === user?.id));
      if (app) {
        console.log("Aplicação encontrada no estado global:", app);
        return app;
      }
    }
    
    // Depois verificamos nas aplicações carregadas para a vaga específica
    if (Array.isArray(jobApplications) && jobApplications.length > 0) {
      const app = jobApplications.find((app) => app.workerId === user?.id || app.user_id === user?.id);
      if (app) {
        console.log("Aplicação encontrada nas aplicações da vaga:", app);
        return app;
      }
    }
    
    // Se não encontrar, retorna null
    return null;
  }, [applications, jobApplications, jobId, user?.id]);

  // Salvar o estado da aplicação do usuário no localStorage para evitar perda durante recarregamentos
  useEffect(() => {
    if (userApplication && user?.id) {
      localStorage.setItem(`job_application_${jobId}_${user.id}`, JSON.stringify(userApplication));
    }
  }, [userApplication, jobId, user?.id]);

  // Recuperar o estado da aplicação do localStorage quando não temos userApplication
  const [localUserApplication, setLocalUserApplication] = useState(null);
  
  useEffect(() => {
    if (!userApplication && user?.id) {
      const storedApplication = localStorage.getItem(`job_application_${jobId}_${user.id}`);
      if (storedApplication) {
        try {
          const parsed = JSON.parse(storedApplication);
          setLocalUserApplication(parsed);
        } catch (e) {
          console.error("Erro ao carregar candidatura do localStorage:", e);
          localStorage.removeItem(`job_application_${jobId}_${user.id}`);
        }
      }
    } else if (userApplication) {
      // Se encontramos a aplicação de verdade, atualizamos o estado local
      setLocalUserApplication(null);
    }
  }, [userApplication, jobId, user?.id]);

  // Usar userApplication ou localUserApplication para determinar o estado da candidatura
  const effectiveUserApplication = userApplication || localUserApplication;

  // Adiciona log para depuração
  console.log('effectiveUserApplication:', effectiveUserApplication);

  const handleApply = async () => {
    if (!user) {
      setError('Você precisa estar logado para se candidatar a esta vaga.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Verifica se o usuário já se candidatou
    if (effectiveUserApplication) {
      setError('Você já se candidatou para esta vaga.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!applicationMessage.trim()) {
      setError('É necessário escrever uma mensagem de candidatura.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      setLoading(true);
      // Passa o ID do usuário, ID da vaga e a mensagem de candidatura
      console.log('Enviando candidatura com job_id:', jobId, 'tipo:', typeof jobId);
      const result = await applyToJob(user.id, jobId, applicationMessage);
      
      if (result) {
        setSuccess('Candidatura enviada com sucesso!');
        setApplicationMessage('');
        
        // Recarregar as candidaturas para atualizar a interface
        const updatedApplications = await getJobApplications(jobId);
        if (updatedApplications) {
          setJobApplications(updatedApplications);
        }
        
        // Criar um objeto de aplicação local enquanto aguardamos a atualização do servidor
        const fakeApplication = {
          id: 'pending-' + Date.now(),
          job_id: jobId,
          user_id: user.id,
          workerId: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Salvar no localStorage para persistir entre recarregamentos
        localStorage.setItem(`job_application_${jobId}_${user.id}`, JSON.stringify(fakeApplication));
        setLocalUserApplication(fakeApplication);
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error);
      let errorMessage = 'Erro ao enviar candidatura. Tente novamente.';
      
      if (error instanceof Error) {
        // Se for erro de já ter se candidatado, atualizamos o estado local
        if (error.message.includes('já se candidatou')) {
          // Criar um objeto de aplicação local
          const fakeApplication = {
            id: 'pending-' + Date.now(),
            job_id: jobId,
            user_id: user.id,
            workerId: user.id,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Salvar no localStorage
          localStorage.setItem(`job_application_${jobId}_${user.id}`, JSON.stringify(fakeApplication));
          setLocalUserApplication(fakeApplication);
        }
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, applicationId: string) => {
    event.preventDefault()
    try {
      // Implementar lógica para aceitar trabalho
      setSuccess('Trabalho aceito com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Erro ao aceitar trabalho:', err)
      setError('Erro ao aceitar trabalho. Tente novamente.')
    }
  }

  // Função para buscar dados completos do usuário
  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      return null;
    }
  };

  // Função para enviar notificação ao usuário
  const sendNotification = async (userId: string, title: string, message: string, type: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          title,
          message,
          type,
          relatedId: jobId,
          relatedType: 'job'
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        setError("Candidatura não encontrada");
        return;
      }
      if (application.status !== 'pending') {
        toast("Esta candidatura já foi aceita.", { icon: '⚠️' });
        return;
      }
      // Atualizar o status da candidatura
      const updateResponse = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: applicationId,
          status: 'accepted_by_company'
        })
      });
      const data = await updateResponse.json();
      if (!updateResponse.ok || !data.success) {
        throw new Error('Erro ao atualizar status da candidatura');
      }
      // Atualizar o status da vaga para 'in_progress'
      await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          status: 'in_progress'
        })
      });
      // Criar ou abrir chat
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: jobId,
          companyId: job?.company_id,
          workerId: application.workerId,
          companyName: job?.companyName,
          workerName: application.worker_name,
          jobTitle: job?.title
        })
      });
      if (chatResponse.ok) {
        const chat = await chatResponse.json();
        router.push(`/chat/${chat.id}`);
      }
      // Recarregar candidaturas do banco para garantir status atualizado
      const updatedApplications = await getJobApplications(jobId);
      if (updatedApplications) {
        setJobApplications(updatedApplications);
      }
      toast.success("Candidatura aceita! O profissional foi notificado e o chat foi aberto.");
    } catch (error) {
      setError("Erro ao aceitar candidatura. Tente novamente.");
      toast.error("Erro ao aceitar candidatura.");
    }
  }

  // Novo: empresa marca como concluída e libera pagamento
  const handleMarkJobCompleted = async (applicationId: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) throw new Error('Candidatura não encontrada');
      // Usa o método do contexto para garantir update correto
      await completeJob(jobId, application.workerId);
      // Recarrega as vagas e candidaturas para refletir a mudança
      if (typeof fetchAllJobs === 'function') await fetchAllJobs();
      if (typeof getJobApplications === 'function') await getJobApplications(jobId);
      toast.success("Trabalho concluído e pagamento liberado!");
    } catch (error) {
      setError("Erro ao concluir trabalho. Tente novamente.");
      toast.error("Erro ao concluir trabalho.");
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        setError("Candidatura não encontrada");
        return;
      }
      
      // Atualizar status da candidatura para rejeitada
      const updateResponse = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: applicationId,
          status: 'rejected'
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar status da candidatura');
      }
      
      // Enviar notificação para o trabalhador
      await sendNotification(
        application.user_id,
        'Candidatura não aceita',
        `Sua candidatura para a vaga "${job?.title}" não foi aceita desta vez.`,
        'application_rejected'
      );
      
      // Atualiza a lista de aplicações localmente
      const updatedApplications = jobApplications.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'rejected' } 
          : app
      );
      setJobApplications(updatedApplications);
      
      setSuccess("Candidatura recusada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      toast.success("Candidatura recusada! O profissional foi notificado.");
    } catch (error) {
      console.error("Erro ao recusar candidatura:", error);
      setError("Erro ao recusar candidatura. Tente novamente.");
      toast.error("Erro ao recusar candidatura.");
    }
  }

  const handleCancelApplication = async (applicationId: string) => {
    try {
      const success = await cancelApplication(applicationId);
      if (success) {
        setSuccess('Candidatura cancelada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Erro ao cancelar candidatura. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    }
  }

  const handleDeleteJob = async () => {
    if (!user || (user.role !== "admin" && user.id !== job?.company_id)) return
    
    // Para usuários normais (não admin), verifica restrições
    if (user.role !== "admin") {
      // Verifica se a vaga já está em andamento ou concluída
      if (job?.status === "in_progress" || job?.status === "completed") {
        setError("Não é possível excluir vagas em andamento ou concluídas.")
        return
      }
      // Só bloqueia se houver candidatura com status 'active'
      const activeApplications = jobApplications.filter(
        app => app.status === "active"
      )
      if (activeApplications.length > 0) {
        setError("Não é possível excluir vagas com trabalho em andamento.")
        return
      }
    }
    
    // Mensagem de confirmação diferente para admin
    const confirmMessage = user.role === "admin" 
      ? "Tem certeza que deseja excluir esta vaga? O saldo será devolvido para a empresa (menos a comissão de R$10)."
      : "Tem certeza que deseja excluir esta vaga? O saldo será devolvido para sua carteira.";
    
    if (confirm(confirmMessage)) {
      try {
        // Dados da vaga para reembolso
        const jobValue = parseFloat(job?.salary_range || "0");
        const companyId = job?.company_id || "";
        
        // Primeiro, cancela a vaga no banco de dados - passa o papel do usuário e userId
        const deleteResponse = await fetch(`/api/jobs?id=${jobId}&role=${user.role}&userId=${user.id}`, {
          method: 'DELETE',
        });
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.error || 'Erro ao excluir vaga');
        }
        
        // Processa reembolso - tanto para empresa quanto para admin
        if (jobValue > 0 && companyId) {
          // Se for administrador, desconta a comissão de 10 reais
          const refundAmount = user.role === "admin" 
            ? Math.max(0, jobValue - 10) // Valor menos comissão, no mínimo zero
            : jobValue; // Valor integral
          
          // Mensagem de descrição apropriada
          const description = user.role === "admin"
            ? `Reembolso parcial (menos comissão) da vaga ${job?.title || jobId} - exclusão por administrador`
            : `Reembolso da vaga ${job?.title || jobId}`;
          
          // Faz uma chamada para o endpoint de reembolso
          const refundResponse = await fetch('/api/wallet/refund', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: companyId,
              amount: refundAmount,
              job_id: jobId,
              description: description,
              isAdmin: user.role === "admin"
            }),
          });
          
          if (refundResponse.ok) {
            // Atualiza o saldo local do usuário para refletir a mudança imediatamente
            const refundData = await refundResponse.json();
            
            // Se for o usuário logado que está recebendo o reembolso, atualiza o saldo na interface
            if (user.id === companyId) {
              await updateWallet(refundData.balance);
              console.log(`Saldo atualizado para: ${refundData.balance}`);
            }
            
            if (user.role === "admin") {
              setSuccess(`Vaga deletada com sucesso pelo administrador. R$${refundAmount} foi devolvido para a empresa (descontada comissão de R$10).`);
            } else {
              setSuccess('Vaga deletada com sucesso e o saldo foi devolvido para sua carteira');
            }
          } else {
            if (user.role === "admin") {
              setSuccess('Vaga deletada com sucesso pelo administrador, mas houve um problema ao devolver o saldo para a empresa');
            } else {
              setSuccess('Vaga deletada com sucesso, mas houve um problema ao devolver o saldo');
            }
          }
        } else {
          setSuccess(user.role === "admin" 
            ? 'Vaga deletada com sucesso pelo administrador (sem valor a reembolsar)' 
            : 'Vaga deletada com sucesso');
        }
        
        // Atualiza a lista de vagas no contexto para refletir a exclusão
        try {
          if (typeof fetchAllJobs === 'function') {
            await fetchAllJobs();
          }
        } catch (err) {
          console.log('Erro ao atualizar lista de vagas, mas a vaga foi excluída com sucesso:', err);
        }
        
        setTimeout(() => {
          setSuccess('');
          // Redireciona para o dashboard com um parâmetro para indicar que a vaga foi excluída
          router.push('/dashboard?job_deleted=true');
        }, 2000);
      } catch (err) {
        console.error('Erro ao deletar vaga:', err);
        setError(err instanceof Error ? err.message : 'Erro ao deletar vaga. Tente novamente.');
        setTimeout(() => setError(''), 5000);
      }
    }
  }

  const canDeleteJob = () => {
    if (!user) return false
    if (user.role === "admin") return true
    if (user.id === job?.companyId && (job?.status === "active" || job?.status === "open")) return true
    return false
  }

  const canEditJob = () => {
    if (!user) return false
    if (user.role === "admin") return true
    if (user.id === job?.companyId && (job?.status === "active" || job?.status === "open")) return true
    return false
  }

  // Função para editar a vaga - redireciona para a página de edição
  const handleEditJob = () => {
    // Redireciona para a página de edição, passando informações sobre o papel do usuário
    const isAdmin = user?.role === "admin";
    router.push(`/jobs/${jobId}/edit?admin=${isAdmin ? 'true' : 'false'}`);
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
              <Button variant="outline" size="sm" onClick={handleEditJob}>
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
                  <CardTitle className="text-2xl">{job?.title || "Título da vaga"}</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {job?.companyName || "Empresa"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {salaryValue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formattedDate}
                    </span>
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    job?.status === "active" || job?.status === "open"
                      ? "default"
                      : job?.status === "in_progress"
                      ? "secondary"
                      : job?.status === "completed"
                      ? "outline"
                      : job?.status === "pending" || job?.status === "pending_worker_confirmation"
                      ? "warning"
                      : job?.status === "cancelled" || job?.status === "closed"
                      ? "destructive"
                      : "default"
                  }
                >
                  {job?.status === "active" || job?.status === "open"
                    ? "Ativa"
                    : job?.status === "in_progress"
                    ? "Em Andamento"
                    : job?.status === "completed"
                    ? "Concluída"
                    : job?.status === "pending" || job?.status === "pending_worker_confirmation"
                    ? "Pendente de confirmação"
                    : job?.status === "cancelled" || job?.status === "closed"
                    ? "Cancelada"
                    : job?.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Pagamento</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {job?.salary_range ? `R$ ${job.salary_range}` : 'R$ 0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Modalidade</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                    <span className="text-gray-700 dark:text-gray-200">{
                      jobType === 'full_time' ? 'Tempo Integral' :
                      jobType === 'part_time' ? 'Meio Período' :
                      jobType === 'contract' ? 'Contrato' :
                      jobType === 'internship' ? 'Estágio' : 'Tipo não especificado'
                    }</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Descrição da Vaga</h3>
                <div className="text-gray-700 whitespace-pre-line">{jobDescription}</div>
              </div>

              {job?.requirements && job?.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Requisitos e Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobRequirements.map((req: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{jobCategory}</Badge>
                <Badge variant="outline">
                  {jobType === "full_time" ? "Tempo Integral" :
                   jobType === "part_time" ? "Meio Período" :
                   jobType === "contract" ? "Contrato" :
                   jobType === "internship" ? "Estágio" : "Tipo não especificado"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Section - Only for Company Owner and Admin */}
          {(user?.id === job?.companyId || user?.role === "admin") && jobApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Candidatos ({jobApplications.length})</CardTitle>
                <CardDescription>Profissionais que se candidataram para esta vaga</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobApplications.map((application) => {
                    return (
                      <div key={application.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={application.userAvatar || "/placeholder.svg"} alt={application.worker_name || 'Usuário'} />
                              <AvatarFallback>
                                {application.worker_name
                                  ? application.worker_name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{application.worker_name || 'Usuário'}</h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Tag className="h-5 w-5 text-gray-500" />
                                <span>{jobCategory}</span>
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">4.5</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Candidatou-se em {new Date(application.created_at || Date.now()).toLocaleDateString("pt-BR")}
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
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Perfil de {application.worker_name}</DialogTitle>
                                <DialogDescription>Informações completas do candidato</DialogDescription>
                              </DialogHeader>
                              <UserProfileContent userId={application.workerId} />
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
                {user?.id === job?.companyId && job?.status === "in_progress" && !jobApplications.some(app => app.status === "completed") && (
                  <Button onClick={() => {
                    const completedApp = jobApplications.find(app => app.status === "accepted_by_company" || app.status === "in_progress" || app.status === "active");
                    if (completedApp && completedApp.id) {
                      handleMarkJobCompleted(completedApp.id);
                    }
                  }}>
                    Marcar como concluído
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Section */}
          {user?.role === "worker" && !effectiveUserApplication && (
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle>Candidatar-se para esta vaga</CardTitle>
                <CardDescription>Envie sua candidatura e mostre por que você é o ideal</CardDescription>
              </CardHeader>
              <CardContent>
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
                  <Button 
                    onClick={handleApply} 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Candidatura
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === "worker" && effectiveUserApplication && (
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle>Status da sua candidatura</CardTitle>
                <CardDescription>Gerencie sua participação nesta vaga</CardDescription>
              </CardHeader>
              <CardContent>
                {effectiveUserApplication.status === "pending" ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <div className="rounded-full p-2 bg-yellow-500/20 w-16 h-16 flex items-center justify-center">
                        <Clock className="h-10 w-10 text-yellow-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Candidatura Enviada</h3>
                    <p className="text-muted-foreground">Aguardando resposta da empresa</p>
                  </div>
                ) : (effectiveUserApplication.status === "pending_worker_confirmation" || effectiveUserApplication.status === "accepted_by_company") ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium mb-2">A empresa aceitou sua candidatura!</h3>
                    <p className="text-muted-foreground mb-4">
                      Deseja aceitar a proposta? Ao aceitar, o chat será iniciado. Após a conclusão do serviço, o saldo será liberado na sua carteira.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <Button onClick={() => handleWorkerAcceptJob(effectiveUserApplication.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceitar Proposta
                      </Button>
                      <Button onClick={() => handleWorkerRejectJob(effectiveUserApplication.id)} className="w-full sm:w-auto" variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                ) : effectiveUserApplication.status === "active" ? (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-lg font-medium mb-2">Trabalho Ativo</h3>
                    <p className="text-muted-foreground">Você está trabalhando nesta vaga</p>
                  </div>
                ) : effectiveUserApplication.status === "completed" ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium mb-2">Trabalho Concluído</h3>
                    <p className="text-muted-foreground">Parabéns! Você concluiu este trabalho</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-medium mb-2">Candidatura Recusada</h3>
                    <p className="text-muted-foreground">Infelizmente sua candidatura não foi aceita</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Avaliações - Apenas para vagas concluídas */}
          {job?.status === "completed" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Avaliações
                </CardTitle>
                <CardDescription>
                  Avalie sua experiência neste trabalho
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.role === "company" && job?.company_id === user.id && (
                  <div className="mb-6 p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Avalie o profissional</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Compartilhe sua experiência trabalhando com este profissional
                    </p>
                    
                    <ReviewDialog 
                      jobId={jobId}
                      reviewedId={effectiveUserApplication?.user_id || ""}
                      reviewedName={effectiveUserApplication?.worker_name || "Profissional"}
                      jobTitle={job?.title || ""}
                      buttonText="Avaliar Profissional"
                    />
                  </div>
                )}
                
                {user?.role === "worker" && effectiveUserApplication?.userId === user.id && (
                  <div className="mb-6 p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Avalie a empresa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Compartilhe sua experiência trabalhando com esta empresa
                    </p>
                    
                    <ReviewDialog 
                      jobId={jobId}
                      reviewedId={job?.company_id || ""}
                      reviewedName={job?.companyName || "Empresa"}
                      jobTitle={job?.title || ""}
                      buttonText="Avaliar Empresa"
                    />
                  </div>
                )}
                
                {/* Lista de avaliações */}
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Avaliações deste trabalho</h3>
                  <div className="space-y-4" id="job-reviews">
                    {/* As avaliações serão carregadas via API */}
                  </div>
                </div>
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
                  <AvatarImage src={company?.logo || job?.companyLogo || "/placeholder.svg"} alt={company?.name || job?.companyName || "Empresa"} />
                  <AvatarFallback>
                    <Building className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{company?.name || job?.companyName || "Empresa"}</h3>
                  {companyReviews.length > 0 ? (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{companyRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500 ml-1">({companyReviews.length} avaliações)</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Sem avaliações</div>
                  )}
                </div>
              </div>

              {(company?.bio || job?.company_description) && (
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{company?.bio || job?.company_description}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Informações</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {(company?.phone || job?.company_phone) && <p>📞 {company?.phone || job?.company_phone}</p>}
                  {(company?.email || job?.company_email) && <p>✉️ {company?.email || job?.company_email}</p>}
                  {(company?.created_at || job?.company_created_at) && (
                    <p>📅 Membro desde {new Date(company?.created_at || job?.company_created_at || "").toLocaleDateString("pt-BR")}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          {companyReviews.length > 0 ? (
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
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Componente para exibir o perfil completo do usuário
function UserProfileContent({ userId }: { userId: string }) {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  
  useEffect(() => {
    const loadUserDetails = async () => {
      setLoading(true);
      try {
        // Carregar detalhes do usuário diretamente da API
        const response = await fetch(`/api/users/${userId}`);
        const userData = response.ok ? await response.json() : null;
        if (userData) {
          setUserDetails(userData);
        }
        // Carregar avaliações do usuário
        const reviewsResponse = await fetch(`/api/reviews?userId=${userId}`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserDetails();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!userDetails) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Não foi possível carregar os detalhes deste usuário.</p>
      </div>
    );
  }
  
  // Calcular média das avaliações
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
    
  // Corrigir data de cadastro para aceitar string ou Date
  let membroDesde = '';
  if (userDetails.created_at) {
    try {
      const data = typeof userDetails.created_at === 'string' || typeof userDetails.created_at === 'number'
        ? new Date(userDetails.created_at)
        : userDetails.created_at;
      membroDesde = data instanceof Date && !isNaN(data.getTime())
        ? data.toLocaleDateString('pt-BR')
        : '';
    } catch {
      membroDesde = '';
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho do perfil */}
      <div className="flex items-start space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={userDetails.avatar || "/placeholder.svg"} alt={userDetails.name || 'Usuário'} />
          <AvatarFallback>
            {userDetails.name
              ? userDetails.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
              : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">{userDetails.name || 'Usuário sem nome'}</h2>
          <div className="flex items-center gap-2 mt-1">
            {userDetails.category && (
              <Badge variant="outline">{userDetails.category}</Badge>
            )}
            {reviews.length > 0 && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm ml-1">({reviews.length} avaliações)</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Informações de contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {userDetails.email || 'Não informado'}
          </p>
        </div>
        {userDetails.phone && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Telefone</h3>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {userDetails.phone}
            </p>
          </div>
        )}
      </div>
      
      {/* Biografia */}
      {userDetails.bio && (
        <div className="space-y-2">
          <h3 className="font-medium">Biografia</h3>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="whitespace-pre-line">{userDetails.bio}</p>
          </div>
        </div>
      )}
      
      {/* Avaliações */}
      <div className="space-y-4">
        <h3 className="font-medium">Avaliações recebidas</h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">Este usuário ainda não possui avaliações.</p>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.reviewer_avatar || "/placeholder.svg"} alt={review.reviewer_name} />
                      <AvatarFallback>{review.reviewer_name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{review.reviewer_name}</span>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
                        fill={i < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(review.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
            {reviews.length > 3 && (
              <Button variant="outline" size="sm" className="w-full">
                Ver todas as {reviews.length} avaliações
              </Button>
            )}
          </div>
        )}
      </div>
      {membroDesde && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Membro desde</h3>
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {membroDesde}
          </p>
        </div>
      )}
    </div>
  );
}
