"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Job, 
  Application, 
  CreateJobData, 
  JobsContextType, 
  ApplicationStatus,
  JobStatus 
} from '@/lib/types/jobs';
import { useAuth } from "./auth-context"
import { useNotifications } from "./notifications-context"
import { createTicketForJob } from "./tickets"
import { useTransactions } from "./transactions-context"

const JobsContext = createContext<JobsContextType | undefined>(undefined)

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { updateWallet } = useAuth()
  const { releaseJobPayment } = useTransactions()

  // Busca todas as vagas do banco de dados
  const fetchAllJobs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/jobs')
      if (!response.ok) throw new Error('Erro ao buscar vagas')
      const data = await response.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao buscar vagas:', err)
      setError('Erro ao carregar vagas')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Carrega as vagas quando o componente é montado
  useEffect(() => {
    fetchAllJobs()
  }, [])

  const getJobsByCompanyId = async (companyId: string): Promise<Job[]> => {
    try {
      console.log(`Buscando vagas da empresa: ${companyId}`);
      
      // Verificação básica
      if (!companyId) {
        console.error('ID da empresa não fornecido');
        return [];
      }
      
      // Força uma nova busca do servidor, ignorando cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/jobs?companyId=${companyId}&_t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar vagas da empresa: ${response.status}`);
      }
      
      const data = await response.json();
      const jobs = Array.isArray(data) ? data : [];
      
      console.log(`Encontradas ${jobs.length} vagas para a empresa ${companyId}`);
      
      // Atualiza o estado local com as vagas da empresa - EVITANDO LOOPS
      // Em vez de atualizar o estado global, apenas retornamos os dados
      // O componente que chamou esta função deve atualizar seu próprio estado
      
      return jobs;
    } catch (error) {
      console.error('Erro ao buscar vagas da empresa:', error);
      return [];
    }
  }

  // Alias para getJobsByCompanyId (mantido para compatibilidade)
  const getJobsByCompany = getJobsByCompanyId;

  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      // Verificação básica para evitar requisições desnecessárias
      if (!id || id.trim() === '') {
        return null;
      }
      
      const response = await fetch(`/api/jobs?jobId=${id}`);
      
      if (!response.ok) {
        // Se o status for 404, apenas retorna null silenciosamente
        if (response.status === 404) {
          return null;
        }
        
        // Para outros erros, registra uma mensagem mais discreta
        console.warn(`Não foi possível buscar a vaga ${id}: ${response.status}`);
        return null;
      }
      
      const job = await response.json();
      return job;
    } catch (error) {
      // Mensagem de erro mais discreta
      console.warn('Erro ao buscar vaga:', error instanceof Error ? error.message : 'Erro desconhecido');
      return null;
    }
  }

  const createJob = async (jobData: CreateJobData): Promise<Job | null> => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro ao criar vaga:', errorData);
        return null;
      }
      
      const newJob = await response.json();
      
      // Atualiza a lista de vagas com a nova vaga
      setJobs(prevJobs => [...prevJobs, newJob]);
      
      return newJob;
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      return null;
    }
  }

  // Função para aplicar para uma vaga
  const applyToJob = async (userId: string, jobId: string, coverLetter: string = ''): Promise<Application | null> => {
    try {
      // Validação básica antes de fazer a requisição
      if (!userId || !jobId) {
        throw new Error('ID do usuário e ID da vaga são obrigatórios');
      }
      
      // Ainda validamos a mensagem para garantir que o usuário escreveu algo,
      // mesmo que não seja mais armazenada no banco de dados
      if (!coverLetter || coverLetter.trim() === '') {
        throw new Error('É necessário escrever uma mensagem de candidatura');
      }
      
      // Verifica localmente se o usuário já se candidatou para esta vaga
      const existingApplication = applications.find(
        app => app.job_id === jobId && app.applicant_id === userId
      );
      
      if (existingApplication) {
        console.log('Usuário já se candidatou para esta vaga (verificação local)');
        throw new Error('Você já se candidatou para esta vaga');
      }
      
      console.log(`Enviando candidatura: userId=${userId}, jobId=${jobId}, coverLetterLength=${coverLetter.length}`);
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job_id: jobId, 
          worker_id: userId, 
          cover_letter: coverLetter // Enviamos para compatibilidade, mas não é mais armazenada
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao se candidatar à vaga');
      }
      
      const application = await response.json();
      console.log('Candidatura enviada com sucesso:', application);
      
      // Atualiza o estado local
      setApplications(prev => [...prev, application]);
      
      // Atualiza a lista de vagas para refletir a nova candidatura
      await fetchAllJobs();
      
      return application;
    } catch (error) {
      console.error('Erro ao aplicar para vaga:', error);
      throw error; // Propaga o erro para ser tratado no componente
    }
  }

  const updateJob = async (id: string, data: Partial<Job>): Promise<Job | null> => {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) return null
    return response.json()
  }

  const acceptApplication = async (applicationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: 'accepted_by_company' })
      });
      if (!response.ok) throw new Error('Erro ao aceitar candidatura');
      // Atualiza localmente
      setApplications(applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'accepted_by_company', accepted_by_company_at: new Date().toISOString() }
          : app
      ));
      return true;
    } catch (error) {
      console.error('Erro ao aceitar candidatura:', error);
      return false;
    }
  }

  const acceptJobByWorker = async (applicationId: string): Promise<boolean> => {
    try {
      const application = applications.find((app) => app.id === applicationId);
      if (!application || application.status !== 'accepted_by_company') return false;
      // Atualiza status da aplicação para active
      const response = await fetch(`/api/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: 'active' })
      });
      if (!response.ok) throw new Error('Erro ao aceitar vaga');
      setApplications(applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'active', accepted_by_worker_at: new Date().toISOString() }
          : app
      ));
      // Atualiza job para in_progress
      await updateJob(application.job_id, {
        status: 'in_progress',
        assigned_worker_id: application.applicant_id
      });
      setJobs(jobs.map(j =>
        j.id === application.job_id
          ? { ...j, status: 'in_progress', assigned_worker_id: application.applicant_id, accepted_at: new Date().toISOString() }
          : j
      ));
      return true;
    } catch (error) {
      console.error('Erro ao aceitar vaga:', error);
      return false;
    }
  }

  const rejectApplication = async (applicationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: 'rejected' })
      });
      if (!response.ok) throw new Error('Erro ao rejeitar candidatura');
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: 'rejected' } : app
      ));
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error);
      return false;
    }
  }

  const cancelApplication = async (applicationId: string): Promise<boolean> => {
    try {
      const application = applications.find((app) => app.id === applicationId);
      if (!application || application.status !== 'pending') return false;
      // Chama rota DELETE
      const response = await fetch(`/api/applications?id=${applicationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao cancelar aplicação');
      setApplications(applications.filter(app => app.id !== applicationId));
      return true;
    } catch (error) {
      console.error('Erro ao cancelar aplicação:', error);
      return false;
    }
  }

  const completeJob = async (jobId: string, workerId: string): Promise<boolean> => {
    try {
      const job = jobs.find((j) => j.id === jobId)
      if (!job || job.status !== "in_progress") {
        console.error('A vaga não está em andamento e não pode ser concluída');
        return false;
      }

      // Verifica se o trabalhador está atribuído à vaga
      const activeApplication = applications.find(
        app => app.job_id === jobId && app.applicant_id === workerId && app.status === "active"
      );
      
      if (!activeApplication) {
        console.error('O trabalhador não está atribuído a esta vaga');
        return false;
      }

      // Atualiza a vaga no banco de dados
      await updateJob(jobId, {
        status: "completed",
        completed_at: new Date().toISOString()
      });

      // Atualiza a aplicação no banco de dados
      await updateApplicationStatus(activeApplication.id, "completed");

      // Atualiza o estado local
      setJobs(jobs.map(j => 
        j.id === jobId 
          ? { ...j, status: "completed", completed_at: new Date().toISOString() } 
          : j
      ));

      setApplications(applications.map(app => 
        app.job_id === jobId && app.status === "active" 
          ? { ...app, status: "completed" } 
          : app
      ));

      // Tenta liberar o pagamento para o trabalhador
      if (releaseJobPayment) {
        const paymentSuccess = releaseJobPayment(jobId, workerId, updateWallet);
        
        if (!paymentSuccess) {
          console.error('Vaga concluída, mas houve um problema ao processar o pagamento');
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao completar vaga:', error);
      return false;
    }
  }

  const cancelJob = async (jobId: string): Promise<boolean> => {
    try {
      // Primeiro, verifica se a vaga existe e seu status
      const job = await getJobById(jobId);
      if (!job) {
        console.error('Vaga não encontrada');
        return false;
      }

      // Verifica se a vaga já está em andamento ou concluída
      if (job.status === 'in_progress' || job.status === 'completed') {
        console.error('Não é possível cancelar vagas em andamento ou concluídas');
        return false;
      }

      // Verifica se há candidaturas aceitas
      const jobApps = applications.filter(app => app.job_id === jobId);
      const hasAcceptedApps = jobApps.some(app => 
        app.status === 'accepted_by_company' || 
        app.status === 'active'
      );

      if (hasAcceptedApps) {
        console.error('Não é possível cancelar vagas com candidaturas aceitas');
        return false;
      }

      // Cancela todas as candidaturas pendentes
      const pendingApps = jobApps.filter(app => app.status === 'pending');
      for (const app of pendingApps) {
        await cancelApplication(app.id);
      }

      // Exclui a vaga
      const response = await fetch(`/api/jobs?id=${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao cancelar vaga');
      }
      
      // Atualiza o estado local
      setJobs(jobs.filter(j => j.id !== jobId));
      
      return true;
    } catch (error) {
      console.error('Erro ao cancelar vaga:', error);
      return false;
    }
  }

  // getJobById já está definido anteriormente como uma função assíncrona

  const getApplicationById = (applicationId: string) => {
    return applications.find((app) => app.id === applicationId)
  }

  const getCompletedJobsByWorker = (workerId: string) => {
    const workerApplications = applications.filter((app) => app.user_id === workerId && app.status === "completed")
    return jobs.filter((job) => workerApplications.some((app) => app.job_id === job.id))
  }

  // Filtra vagas ativas (com status 'open', 'active', 'published' ou 'in_progress')
  const getActiveJobs = () => {
    return jobs.filter((job: Job) => {
      if (!job.status) return false;
      const status = job.status.toUpperCase();
      return ['OPEN', 'ACTIVE', 'PUBLISHED', 'IN_PROGRESS'].includes(status);
    });
  }

  const getLatestJobs = (limit = 5) => {
    return jobs
      .filter((job) => job.status && job.status.toUpperCase() === "ACTIVE")
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, limit)
  }

  const getJobStats = (userId: string, role: string) => {
    if (role === "worker") {
      const workerApplications = applications.filter((app) => app.workerId === userId)
      const completedJobs = getCompletedJobsByWorker(userId)
      const activeApplications = workerApplications.filter((app) => app.status === "pending")

      return {
        totalApplications: workerApplications.length,
        completedJobs: completedJobs.length,
        activeApplications: activeApplications.length,
        pendingApplications: workerApplications.filter((app) => app.status === "pending").length,
      }
    } else if (role === "company") {
      const companyJobs = jobs.filter((job) => job.companyId === userId)
      // Inclui todos os status que representam vagas ativas
      const activeJobs = companyJobs.filter((job) => 
        ['open', 'active', 'published', 'in_progress'].includes(job.status?.toLowerCase() || '')
      )
      const inProgressJobs = companyJobs.filter((job) => job.status?.toLowerCase() === "in_progress")
      const completedJobs = companyJobs.filter((job) => job.status?.toLowerCase() === "completed")

      return {
        totalJobs: companyJobs.length,
        activeJobs: activeJobs.length,
        inProgressJobs: inProgressJobs.length,
        completedJobs: completedJobs.length,
      }
    }

    return {}
  }

  // Retorna todas as candidaturas de uma vaga
  const getJobApplications = async (jobId: string) => {
    try {
      // Primeiro, verifica se temos aplicações locais
      let jobApps = applications.filter(app => app.job_id === jobId);
      
      // Se não temos aplicações no estado local, busca do servidor
      if (jobApps.length === 0) {
        const response = await fetch(`/api/applications?jobId=${jobId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar candidaturas da vaga');
        }
        
        const fetchedApps = await response.json();
        
        // Atualiza o estado local
        if (Array.isArray(fetchedApps)) {
          setApplications(prev => {
            // Remove aplicações existentes para esta vaga
            const filtered = prev.filter(app => app.job_id !== jobId);
            // Adiciona as novas aplicações
            return [...filtered, ...fetchedApps];
          });
          
          // Retorna as aplicações buscadas
          return fetchedApps;
        }
      }
      
      return jobApps;
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
      return [];
    }
  }

  // Retorna todas as candidaturas de um trabalhador
  const getApplicationsByWorker = (workerId: string) => {
    return applications.filter(app => app.applicant_id === workerId);
  }

  // Retorna todas as vagas armazenadas no estado local
  const getAllJobs = (): Job[] => {
    return [...jobs];
  }

  // Atualiza o status de uma candidatura
  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus): Promise<boolean> => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar status da candidatura');
      // Opcional: atualizar estado local de applications
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  }

  return (
    <JobsContext.Provider
      value={{
        jobs,
        applications,
        isLoading,
        error,
        fetchAllJobs,
        createJob,
        applyToJob,
        updateApplicationStatus: updateApplicationStatus as any,
        getJobsByCompanyId,
        getJobsByCompany,
        getApplicationsByWorker,
        getJobById: getJobById as any,
        getApplicationById: getApplicationById as any,
        getCompletedJobsByWorker,
        getActiveJobs,
        cancelJob,
        getJobStats: getJobStats as any,
        getLatestJobs: getLatestJobs as any,
        cancelApplication: cancelApplication as any,
        getJobApplications: getJobApplications as any,
        completeJob,
        getAllJobs,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export default JobsProvider;

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
}
