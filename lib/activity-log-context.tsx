"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface ActivityLog {
  id: string
  type:
    | "job_posted"
    | "job_accepted"
    | "balance_request"
    | "withdrawal_request"
    | "job_completed"
    | "profile_updated"
    | "user_registered"
    | "application_submitted"
  userId: string
  userName: string
  userRole: "admin" | "company" | "worker"
  description: string
  details?: any
  timestamp: string
}

interface ActivityLogContextType {
  activities: ActivityLog[]
  addActivity: (activity: Omit<ActivityLog, "id" | "timestamp">) => void
  getRecentActivities: (limit?: number) => ActivityLog[]
  getActivitiesByUser: (userId: string) => ActivityLog[]
  getActivitiesByType: (type: ActivityLog["type"]) => ActivityLog[]
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined)

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<ActivityLog[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("activity_logs")
    if (saved) {
      setActivities(JSON.parse(saved))
    }
  }, [])

  const saveActivities = (updated: ActivityLog[]) => {
    setActivities(updated)
    localStorage.setItem("activity_logs", JSON.stringify(updated))
  }

  const addActivity = (activity: Omit<ActivityLog, "id" | "timestamp">) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }

    const updated = [newActivity, ...activities]
    saveActivities(updated)
  }

  const getRecentActivities = (limit = 10) => {
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)
  }

  const getActivitiesByUser = (userId: string) => {
    return activities.filter((activity) => activity.userId === userId)
  }

  const getActivitiesByType = (type: ActivityLog["type"]) => {
    return activities.filter((activity) => activity.type === type)
  }

  return (
    <ActivityLogContext.Provider
      value={{
        activities,
        addActivity,
        getRecentActivities,
        getActivitiesByUser,
        getActivitiesByType,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  )
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext)
  if (context === undefined) {
    throw new Error("useActivityLog must be used within an ActivityLogProvider")
  }
  return context
}
