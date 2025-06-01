"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Job {
  id: string
  title: string
  description: string
  category: string
  location: string
  type: "remote" | "presencial" | "freelance"
  salary: number
  companyId: string
  companyName: string
  companyLogo?: string
  status: "active" | "paused" | "closed" | "in_progress" | "completed" | "cancelled"
  requirements: string[]
  createdAt: string
  applications: Application[]
  assignedWorkerId?: string
  assignedWorkerName?: string
  completedAt?: string
  acceptedAt?: string
  ticketId?: string
}

export interface Application {
  id: string
  jobId: string
  workerId: string
  workerName: string
  workerAvatar?: string
  workerBio?: string
  workerRating: number
  status: "pending" | "accepted_by_company" | "accepted_by_worker" | "active" | "completed" | "rejected"
  appliedAt: string
  acceptedByCompanyAt?: string
  acceptedByWorkerAt?: string
  message?: string
}

interface JobsContextType {
  jobs: Job[]
  applications: Application[]
  createJob: (jobData: Omit<Job, "id" | "createdAt" | "applications">) => string | false
  applyToJob: (jobId: string, workerId: string, workerName: string, workerAvatar?: string, message?: string) => boolean
  acceptApplication: (applicationId: string) => boolean
  acceptJobByWorker: (applicationId: string) => boolean
  rejectApplication: (applicationId: string) => boolean
  completeJob: (jobId: string) => boolean
  cancelJob: (jobId: string) => boolean
  getJobsByCompany: (companyId: string) => Job[]
  getApplicationsByWorker: (workerId: string) => Application[]
  getJobById: (jobId: string) => Job | undefined
  getApplicationById: (applicationId: string) => Application | undefined
  getActiveJobs: () => Job[]
  getCompletedJobsByWorker: (workerId: string) => Job[]
  getJobStats: (userId: string, role: string) => any
  getLatestJobs: (limit?: number) => Job[]
  cancelApplication: (applicationId: string) => boolean
}

const JobsContext = createContext<JobsContextType | undefined>(undefined)

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    const savedJobs = localStorage.getItem("jobs")
    const savedApplications = localStorage.getItem("applications")

    if (savedJobs) {
      setJobs(JSON.parse(savedJobs))
    }
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications))
    }
  }, [])

  const saveJobs = (updatedJobs: Job[]) => {
    setJobs(updatedJobs)
    localStorage.setItem("jobs", JSON.stringify(updatedJobs))
  }

  const saveApplications = (updatedApplications: Application[]) => {
    setApplications(updatedApplications)
    localStorage.setItem("applications", JSON.stringify(updatedApplications))
  }

  const createTicketForJob = (
    jobId: string,
    jobTitle: string,
    jobLocation: string,
    jobValue: number,
    companyId: string,
    companyName: string,
    workerId: string,
    workerName: string,
  ): string => {
    // Create a simple ticket ID for now
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const createJob = (jobData: Omit<Job, "id" | "createdAt" | "applications">): string | false => {
    const jobId = Date.now().toString()
    const newJob: Job = {
      ...jobData,
      id: jobId,
      createdAt: new Date().toISOString(),
      applications: [],
    }

    const updatedJobs = [...jobs, newJob]
    saveJobs(updatedJobs)
    return jobId
  }

  const applyToJob = (
    jobId: string,
    workerId: string,
    workerName: string,
    workerAvatar?: string,
    message?: string,
  ): boolean => {
    // Check if already applied
    if (applications.find((app) => app.jobId === jobId && app.workerId === workerId)) {
      return false
    }

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId,
      workerId,
      workerName,
      workerAvatar,
      workerRating: 4.5,
      status: "pending",
      appliedAt: new Date().toISOString(),
      message,
    }

    const updatedApplications = [...applications, newApplication]
    saveApplications(updatedApplications)
    return true
  }

  const acceptApplication = (applicationId: string): boolean => {
    const application = applications.find((app) => app.id === applicationId)
    if (!application) return false

    const updatedApplications = applications.map((app) =>
      app.id === applicationId
        ? {
            ...app,
            status: "accepted_by_company" as const,
            acceptedByCompanyAt: new Date().toISOString(),
          }
        : app,
    )
    saveApplications(updatedApplications)
    return true
  }

  const acceptJobByWorker = (applicationId: string): boolean => {
    const application = applications.find((app) => app.id === applicationId)
    if (!application || application.status !== "accepted_by_company") return false

    const job = jobs.find((j) => j.id === application.jobId)
    if (!job) return false

    // Create ticket for communication
    const ticketId = createTicketForJob(
      job.id,
      job.title,
      job.location,
      job.salary,
      job.companyId,
      job.companyName,
      application.workerId,
      application.workerName,
    )

    // Update application to active
    const updatedApplications = applications.map((app) =>
      app.id === applicationId
        ? {
            ...app,
            status: "active" as const,
            acceptedByWorkerAt: new Date().toISOString(),
          }
        : app,
    )
    saveApplications(updatedApplications)

    // Update job status to in_progress and add ticket reference
    const updatedJobs = jobs.map((j) =>
      j.id === application.jobId
        ? {
            ...j,
            status: "in_progress" as const,
            assignedWorkerId: application.workerId,
            assignedWorkerName: application.workerName,
            acceptedAt: new Date().toISOString(),
            ticketId: ticketId,
          }
        : j,
    )
    saveJobs(updatedJobs)

    return true
  }

  const rejectApplication = (applicationId: string): boolean => {
    const updatedApplications = applications.map((app) =>
      app.id === applicationId ? { ...app, status: "rejected" as const } : app,
    )
    saveApplications(updatedApplications)
    return true
  }

  const cancelApplication = (applicationId: string): boolean => {
    const application = applications.find((app) => app.id === applicationId)
    if (!application || application.status !== "pending") return false

    const updatedApplications = applications.filter((app) => app.id !== applicationId)
    saveApplications(updatedApplications)
    return true
  }

  const completeJob = (jobId: string): boolean => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job || job.status !== "in_progress") return false

    // Update job status
    const updatedJobs = jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            status: "completed" as const,
            completedAt: new Date().toISOString(),
          }
        : j,
    )
    saveJobs(updatedJobs)

    // Update application status
    const updatedApplications = applications.map((app) =>
      app.jobId === jobId && app.status === "active" ? { ...app, status: "completed" as const } : app,
    )
    saveApplications(updatedApplications)

    return true
  }

  const cancelJob = (jobId: string): boolean => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job || job.status === "in_progress" || job.status === "completed") return false

    const updatedJobs = jobs.map((j) => (j.id === jobId ? { ...j, status: "cancelled" as const } : j))
    saveJobs(updatedJobs)

    // Cancel all pending applications for this job
    const updatedApplications = applications.map((app) =>
      app.jobId === jobId && app.status === "pending" ? { ...app, status: "rejected" as const } : app,
    )
    saveApplications(updatedApplications)

    return true
  }

  const getJobsByCompany = (companyId: string) => {
    return jobs.filter((job) => job.companyId === companyId)
  }

  const getApplicationsByWorker = (workerId: string) => {
    return applications.filter((app) => app.workerId === workerId)
  }

  const getJobById = (jobId: string) => {
    return jobs.find((job) => job.id === jobId)
  }

  const getApplicationById = (applicationId: string) => {
    return applications.find((app) => app.id === applicationId)
  }

  const getActiveJobs = () => {
    return jobs.filter((job) => job.status === "active")
  }

  const getCompletedJobsByWorker = (workerId: string) => {
    const workerApplications = applications.filter((app) => app.workerId === workerId && app.status === "completed")
    return jobs.filter((job) => workerApplications.some((app) => app.jobId === job.id))
  }

  const getLatestJobs = (limit = 5) => {
    return jobs
      .filter((job) => job.status === "active")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
      const activeJobs = companyJobs.filter((job) => job.status === "active")
      const inProgressJobs = companyJobs.filter((job) => job.status === "in_progress")
      const completedJobs = companyJobs.filter((job) => job.status === "completed")

      return {
        totalJobs: companyJobs.length,
        activeJobs: activeJobs.length,
        inProgressJobs: inProgressJobs.length,
        completedJobs: completedJobs.length,
      }
    }

    return {}
  }

  return (
    <JobsContext.Provider
      value={{
        jobs,
        applications,
        createJob,
        applyToJob,
        acceptApplication,
        acceptJobByWorker,
        rejectApplication,
        completeJob,
        cancelJob,
        getJobsByCompany,
        getApplicationsByWorker,
        getJobById,
        getApplicationById,
        getActiveJobs,
        getCompletedJobsByWorker,
        getJobStats,
        getLatestJobs,
        cancelApplication,
      }}
    >
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs() {
  const context = useContext(JobsContext)
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobsProvider")
  }
  return context
}
