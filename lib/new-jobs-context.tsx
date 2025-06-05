'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca todas as vagas
  const fetchAllJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Erro ao buscar vagas');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar vagas');
      console.error('Erro ao buscar vagas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cria uma nova vaga
  const createJob = async (jobData: CreateJobData): Promise<Job | null> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) throw new Error('Erro ao criar vaga');
      
      const newJob = await response.json();
      setJobs(prev => [...prev, newJob]);
      addNotification({ type: 'success', message: 'Vaga criada com sucesso!' });
      return newJob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar vaga';
      setError(message);
      addNotification({ type: 'error', message });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Candidata-se a uma vaga
  const applyToJob = async (jobId: string, message: string): Promise<boolean> => {
    if (!user) {
      addNotification({ type: 'error', message: 'Você precisa estar logado para se candidatar' });
      return false;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: user.id })
      });

      if (!response.ok) throw new Error('Erro ao se candidatar à vaga');
      
      const application = await response.json();
      setApplications(prev => [...prev, application]);
      addNotification({ type: 'success', message: 'Candidatura enviada com sucesso!' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao se candidatar';
      setError(message);
      addNotification({ type: 'error', message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza o status de uma candidatura
  const updateApplicationStatus = async (
    applicationId: string, 
    status: ApplicationStatus
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Erro ao atualizar status da candidatura');
      
      const updatedApp = await response.json();
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? updatedApp : app)
      );
      
      // Se a candidatura foi aceita, criar um ticket
      if (status === 'accepted') {
        await createTicketForJob(updatedApp.job_id, updatedApp.user_id);
      }
      
      addNotification({ type: 'success', message: 'Status atualizado com sucesso!' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      setError(message);
      addNotification({ type: 'error', message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Busca vagas por empresa
  const getJobsByCompanyId = async (companyId: string): Promise<Job[]> => {
    try {
      const response = await fetch(`/api/companies/${companyId}/jobs`);
      if (!response.ok) throw new Error('Erro ao buscar vagas da empresa');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar vagas');
      return [];
    }
  };

  // Filtra vagas por empresa (local)
  const getJobsByCompany = (companyId: string): Job[] => {
    return jobs.filter(job => job.company_id === companyId);
  };

  // Filtra candidaturas por trabalhador
  const getApplicationsByWorker = (workerId: string): Application[] => {
    return applications.filter(app => app.user_id === workerId);
  };

  // Busca uma vaga por ID
  const getJobById = async (id: string): Promise<Job | null> => {
    const cachedJob = jobs.find(job => job.id === id);
    if (cachedJob) return cachedJob;
    
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error('Erro ao buscar vaga:', err);
      return null;
    }
  };

  // Busca uma candidatura por ID
  const getApplicationById = (id: string): Application | undefined => {
    return applications.find(app => app.id === id);
  };

  // Filtra vagas concluídas por trabalhador
  const getCompletedJobsByWorker = (workerId: string): Job[] => {
    const workerApplications = applications.filter(
      app => app.user_id === workerId && app.status === 'completed'
    );
    return jobs.filter(job => 
      workerApplications.some(app => app.job_id === job.id)
    );
  };

  // Filtra vagas ativas
  const getActiveJobs = (): Job[] => {
    return jobs.filter(job => 
      job.status === 'open' || 
      job.status === 'active' || 
      job.status === 'published' || 
      job.status === 'in_progress'
    );
  };

  // Cancela uma vaga
  const cancelJob = async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao cancelar vaga');
      
      setJobs(prev => prev.filter(job => job.id !== jobId));
      addNotification({ type: 'success', message: 'Vaga cancelada com sucesso!' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar vaga';
      addNotification({ type: 'error', message });
      return false;
    }
  };

  // Obtém estatísticas das vagas
  const getJobStats = () => {
    return {
      total: jobs.length,
      active: jobs.filter(job => job.status === 'active').length,
      completed: jobs.filter(job => job.status === 'completed').length,
      pending: applications.filter(app => app.status === 'pending').length
    };
  };

  // Busca as últimas vagas
  const getLatestJobs = (limit: number = 5): Job[] => {
    return [...jobs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  // Cancela uma candidatura
  const cancelApplication = async (applicationId: string): Promise<boolean> => {
    return updateApplicationStatus(applicationId, 'cancelled');
  };

  // Busca candidaturas de uma vaga
  const getJobApplications = (jobId: string): Application[] => {
    return applications.filter(app => app.job_id === jobId);
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchAllJobs();
  }, []);

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
        updateApplicationStatus,
        getJobsByCompanyId,
        getJobsByCompany,
        getApplicationsByWorker,
        getJobById,
        getApplicationById,
        getCompletedJobsByWorker,
        getActiveJobs,
        cancelJob,
        getJobStats,
        getLatestJobs,
        cancelApplication,
        getJobApplications,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export const useJobs = (): JobsContextType => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
