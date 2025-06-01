"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { useNotifications } from "./notifications-context"

export interface JobApplication {
  id: string
  jobId: string
  applicantId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  updatedAt: string
}

interface ApplicationsContextType {
  applications: JobApplication[]
  applyForJob: (jobId: string, applicantId: string) => Promise<boolean>
  updateApplicationStatus: (applicationId: string, status: "accepted" | "rejected") => void
  getJobApplications: (jobId: string) => JobApplication[]
  getUserApplications: (userId: string) => JobApplication[]
  hasApplied: (jobId: string, userId: string) => boolean
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined)

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const { user, getUserById } = useAuth()
  const { addNotification } = useNotifications()

  // Carrega candidaturas do localStorage
  useEffect(() => {
    const savedApplications = localStorage.getItem("applications")
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications))
    }
  }, [])

  // Salva candidaturas no localStorage
  const saveApplications = (updatedApplications: JobApplication[]) => {
    setApplications(updatedApplications)
    localStorage.setItem("applications", JSON.stringify(updatedApplications))
  }

  const applyForJob = async (jobId: string, applicantId: string): Promise<boolean> => {
    // Verifica se já se candidatou
    if (hasApplied(jobId, applicantId)) {
      return false
    }

    const newApplication: JobApplication = {
      id: Date.now().toString(),
      jobId,
      applicantId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedApplications = [...applications, newApplication]
    saveApplications(updatedApplications)

    // Envia notificação para a empresa
    const applicant = getUserById(applicantId)
    if (applicant) {
      addNotification({
        userId: jobId.split("-")[0], // Assumindo que o jobId começa com o ID da empresa
        type: "job_application",
        title: "Nova Candidatura",
        message: `${applicant.name} se candidatou para sua vaga`,
        jobId,
        applicantId,
      })
    }

    return true
  }

  const updateApplicationStatus = (applicationId: string, status: "accepted" | "rejected") => {
    const application = applications.find((a) => a.id === applicationId)
    if (!application) return

    const updatedApplications = applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            status,
            updatedAt: new Date().toISOString(),
          }
        : a
    )
    saveApplications(updatedApplications)

    // Envia notificação para o candidato
    const notificationType = status === "accepted" ? "application_accepted" : "application_rejected"
    const notificationTitle = status === "accepted" ? "Candidatura Aceita" : "Candidatura Recusada"
    const notificationMessage = status === "accepted"
      ? "Sua candidatura foi aceita! A empresa entrará em contato."
      : "Infelizmente sua candidatura não foi aceita desta vez."

    addNotification({
      userId: application.applicantId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      jobId: application.jobId,
    })
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
