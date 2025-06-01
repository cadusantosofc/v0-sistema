"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Ticket {
  id: string
  jobId: string
  jobTitle: string
  jobLocation: string
  jobValue: number
  companyId: string
  companyName: string
  workerId: string
  workerName: string
  status: "open" | "completed" | "reopened"
  createdAt: string
  completedAt?: string
  reopenedAt?: string
  reopenedBy?: string
  messages: TicketMessage[]
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  senderRole: "admin" | "company" | "worker"
  message: string
  type: "text" | "audio"
  timestamp: string
  audioUrl?: string
}

interface TicketsContextType {
  tickets: Ticket[]
  createTicket: (
    jobId: string,
    jobTitle: string,
    jobLocation: string,
    jobValue: number,
    companyId: string,
    companyName: string,
    workerId: string,
    workerName: string,
  ) => string
  sendMessage: (
    ticketId: string,
    senderId: string,
    senderName: string,
    senderRole: "admin" | "company" | "worker",
    message: string,
    type?: "text" | "audio",
    audioUrl?: string,
  ) => void
  completeTicket: (ticketId: string) => void
  reopenTicket: (ticketId: string, adminId: string) => void
  getTicketById: (ticketId: string) => Ticket | undefined
  getUserTickets: (userId: string) => Ticket[]
  getCompanyTickets: (companyId: string) => Ticket[]
  getAllTickets: () => Ticket[]
  canSendMessage: (ticketId: string) => boolean
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined)

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("tickets")
    if (saved) {
      setTickets(JSON.parse(saved))
    }
  }, [])

  const saveTickets = (updated: Ticket[]) => {
    setTickets(updated)
    localStorage.setItem("tickets", JSON.stringify(updated))
  }

  const createTicket = (
    jobId: string,
    jobTitle: string,
    jobLocation: string,
    jobValue: number,
    companyId: string,
    companyName: string,
    workerId: string,
    workerName: string,
  ): string => {
    const newTicket: Ticket = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      jobId,
      jobTitle,
      jobLocation,
      jobValue,
      companyId,
      companyName,
      workerId,
      workerName,
      status: "open",
      createdAt: new Date().toISOString(),
      messages: [],
    }

    const updated = [...tickets, newTicket]
    saveTickets(updated)
    return newTicket.id
  }

  const sendMessage = (
    ticketId: string,
    senderId: string,
    senderName: string,
    senderRole: "admin" | "company" | "worker",
    message: string,
    type: "text" | "audio" = "text",
    audioUrl?: string,
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket || !canSendMessage(ticketId)) return

    const newMessage: TicketMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ticketId,
      senderId,
      senderName,
      senderRole,
      message,
      type,
      timestamp: new Date().toISOString(),
      audioUrl,
    }

    const updated = tickets.map((t) => (t.id === ticketId ? { ...t, messages: [...t.messages, newMessage] } : t))
    saveTickets(updated)
  }

  const completeTicket = (ticketId: string) => {
    const updated = tickets.map((t) =>
      t.id === ticketId ? { ...t, status: "completed" as const, completedAt: new Date().toISOString() } : t,
    )
    saveTickets(updated)
  }

  const reopenTicket = (ticketId: string, adminId: string) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: "reopened" as const,
            reopenedAt: new Date().toISOString(),
            reopenedBy: adminId,
          }
        : t,
    )
    saveTickets(updated)
  }

  const getTicketById = (ticketId: string) => {
    return tickets.find((t) => t.id === ticketId)
  }

  const getUserTickets = (userId: string) => {
    return tickets
      .filter((t) => t.workerId === userId || t.companyId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getCompanyTickets = (companyId: string) => {
    return tickets
      .filter((t) => t.companyId === companyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getAllTickets = () => {
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const canSendMessage = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    return ticket?.status === "open" || ticket?.status === "reopened"
  }

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        createTicket,
        sendMessage,
        completeTicket,
        reopenTicket,
        getTicketById,
        getUserTickets,
        getCompanyTickets,
        getAllTickets,
        canSendMessage,
      }}
    >
      {children}
    </TicketsContext.Provider>
  )
}

export function useTickets() {
  const context = useContext(TicketsContext)
  if (context === undefined) {
    throw new Error("useTickets must be used within a TicketsProvider")
  }
  return context
}
