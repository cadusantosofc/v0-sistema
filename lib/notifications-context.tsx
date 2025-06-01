"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

export interface Notification {
  id: string
  userId: string // ID do usuário que deve receber a notificação
  type: "job_application" | "application_accepted" | "application_rejected"
  title: string
  message: string
  jobId: string
  applicantId?: string // ID do candidato (quando relevante)
  read: boolean
  createdAt: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  getUserNotifications: (userId: string) => Notification[]
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  // Carrega notificações do localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  // Salva notificações no localStorage
  const saveNotifications = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  const addNotification = (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    }

    const updatedNotifications = [newNotification, ...notifications]
    saveNotifications(updatedNotifications)
  }

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    )
    saveNotifications(updatedNotifications)
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    saveNotifications(updatedNotifications)
  }

  const getUserNotifications = (userId: string) => {
    return notifications.filter((n) => n.userId === userId)
  }

  const unreadCount = user
    ? notifications.filter((n) => n.userId === user.id && !n.read).length
    : 0

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUserNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
