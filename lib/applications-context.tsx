"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { useNotifications } from "./notifications-context"
import { createApplication, updateApplicationStatus, getApplicationsByJobId, getApplicationsByUserId } from "@/lib/api/applications"

export interface JobApplication {
  id: string
  jobId: string
  applicantId: string
  status: 'pending' | 'pending_worker_confirmation' | 'accepted' | 'rejected' | 'accepted_by_company' | 'active' | 'completed'
  createdAt: string
  updatedAt: string
}

interface ApplicationsContextType {
  applications: JobApplication[]
  applyForJob: (jobId: string, applicantId: string) => Promise<boolean>
  updateApplicationStatus: (applicationId: string, status: JobApplication['status']) => void
  getJobApplications: (jobId: string) => JobApplication[]
  getUserApplications: (userId: string) => JobApplication[]
  hasApplied: (jobId: string, userId: string) => boolean
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined)

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const { user, getUserById } = useAuth()
  const { addNotification } = useNotifications()

  // Carrega candidaturas do banco de dados
  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.id) return;
      
      try {
        const userApps = await getApplicationsByUserId(user.id);
        setApplications(Array.isArray(userApps) ? userApps : []);
      } catch (error) {
        console.error("Erro ao carregar candidaturas:", error);
        // Garante que applications seja sempre um array, mesmo em caso de erro
        setApplications([]);
      }
    };

    loadApplications();
  }, [user?.id])

  const applyForJob = async (jobId: string, applicantId: string): Promise<boolean> => {
    try {
      // Verifica se já se candidatou
      if (hasApplied(jobId, applicantId)) {
        return false
      }

      // Cria candidatura no banco
      const application = await createApplication({
        job_id: jobId,
        applicant_id: applicantId,
        status: "pending"
      })

      // Atualiza o estado
      const updatedApplications = [...applications, application]
      setApplications(updatedApplications)

      // Envia notificação para a empresa
      try {
        const applicant = await getUserById(applicantId);
        if (applicant) {
          addNotification({
            userId: jobId.split("-")[0], // Assumindo que o jobId começa com o ID da empresa
            type: "job_application",
            title: "Nova Candidatura",
            message: `${applicant.name} se candidatou para sua vaga`,
            jobId,
            applicantId,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do candidato:", error);
        // Não interrompe o fluxo se falhar ao buscar o nome
        addNotification({
          userId: jobId.split("-")[0],
          type: "job_application",
          title: "Nova Candidatura",
          message: "Um novo candidato se inscreveu para sua vaga",
          jobId,
          applicantId,
        });
      }

      return true
    } catch (error) {
      console.error("Erro ao criar candidatura:", error)
      return false
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: JobApplication['status']) => {
    try {
      const application = applications.find((a) => a.id === applicationId)
      if (!application) return

      // Atualiza no banco
      await updateApplicationStatusApi(applicationId, status)

      // Atualiza o estado
      const updatedApplications = applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
      setApplications(updatedApplications)

      // Notificações customizadas por status
      let notificationType = ''
      let notificationTitle = ''
      let notificationMessage = ''
      if (status === 'accepted_by_company') {
        notificationType = 'application_proposed'
        notificationTitle = 'Proposta enviada'
        notificationMessage = 'A empresa enviou uma proposta para você.'
      } else if (status === 'active') {
        notificationType = 'application_accepted_by_worker'
        notificationTitle = 'Proposta aceita'
        notificationMessage = 'Você aceitou a proposta. O trabalho vai começar!'
      } else if (status === 'rejected') {
        notificationType = 'application_rejected'
        notificationTitle = 'Candidatura Recusada'
        notificationMessage = 'Infelizmente sua candidatura não foi aceita desta vez.'
      } else if (status === 'completed') {
        notificationType = 'application_completed'
        notificationTitle = 'Trabalho concluído'
        notificationMessage = 'O trabalho foi concluído e o saldo será liberado.'
      }
      if (notificationType) {
        addNotification({
          userId: application.applicantId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          jobId: application.jobId,
          applicantId: application.applicantId,
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar status da candidatura:', error)
    }
  }

  const getJobApplications = (jobId: string) => {
    return applications.filter((a) => a.jobId === jobId)
  }

  const getUserApplications = (userId: string) => {
    return applications.filter((a) => a.applicantId === userId)
  }

  const hasApplied = (jobId: string, userId: string) => {
    return applications.some((a) => a.jobId === jobId && a.applicantId === userId)
  }

  return (
    <ApplicationsContext.Provider
      value={{
        applications,
        applyForJob,
        updateApplicationStatus,
        getJobApplications,
        getUserApplications,
        hasApplied,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  )
}

export function useApplications() {
  const context = useContext(ApplicationsContext)
  if (context === undefined) {
    throw new Error("useApplications must be used within an ApplicationsProvider")
  }
  return context
}
