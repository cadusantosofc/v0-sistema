"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, Mic, MicOff, Search, Clock, RotateCcw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTickets } from "@/lib/tickets-context"
import { useNotifications } from "@/lib/notifications-context"
import { useRealtime } from "@/lib/realtime-context"

export default function ChatPage() {
  const { user } = useAuth()
  const { tickets, sendMessage, canSendMessage, reopenTicket, getTicketById } = useTickets()
  const { addNotification } = useNotifications()
  const { forceUpdate } = useRealtime()
  const searchParams = useSearchParams()
  const [selectedTicketId, setSelectedTicketId] = useState<string>("")
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get ticket from URL parameter
  useEffect(() => {
    const ticketId = searchParams.get("ticket")
    if (ticketId) {
      setSelectedTicketId(ticketId)
    }
  }, [searchParams])

  const userTickets = user
    ? tickets.filter((t) => t.workerId === user.id || t.companyId === user.id || user.role === "admin")
    : []

  const filteredTickets = userTickets.filter(
    (ticket) =>
      ticket.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.workerName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedTicket = getTicketById(selectedTicketId)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedTicket?.messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicketId || !user || !canSendMessage(selectedTicketId)) return

    const senderRole = user.role as "admin" | "company" | "worker"
    sendMessage(selectedTicketId, user.id, user.name, senderRole, newMessage.trim())

    // Notify other participants
    if (selectedTicket) {
      const otherParticipants = [selectedTicket.companyId, selectedTicket.workerId].filter((id) => id !== user.id)
      otherParticipants.forEach((participantId) => {
        addNotification({
          userId: participantId,
          type: "message",
          title: "Nova Mensagem",
          message: `${user.name}: ${newMessage.trim()}`,
          read: false,
          link: `/chat?ticket=${selectedTicketId}`,
          data: { ticketId: selectedTicketId },
        })
      })
    }

    setNewMessage("")
    forceUpdate()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReopenTicket = () => {
    if (!user || user.role !== "admin" || !selectedTicketId) return

    reopenTicket(selectedTicketId, user.id)

    // Notify participants
    if (selectedTicket) {
      ;[selectedTicket.companyId, selectedTicket.workerId].forEach((participantId) => {
        addNotification({
          userId: participantId,
          type: "system",
          title: "Ticket Reaberto",
          message: `O ticket "${selectedTicket.jobTitle}" foi reaberto pelo administrador`,
          read: false,
          link: `/chat?ticket=${selectedTicketId}`,
          data: { ticketId: selectedTicketId },
        })
      })
    }

    forceUpdate()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">Aberto</Badge>
      case "completed":
        return <Badge variant="secondary">Concluído</Badge>
      case "reopened":
        return <Badge variant="outline">Reaberto</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getOtherParticipant = (ticket: any) => {
    if (!user) return { name: "", avatar: "" }

    if (user.id === ticket.companyId) {
      return { name: ticket.workerName, avatar: "/placeholder.svg" }
    } else {
      return { name: ticket.companyName, avatar: "/placeholder.svg" }
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Você precisa estar logado para acessar o chat.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sistema de Tickets</h1>
        <p className="text-gray-600">Gerencie suas conversas e histórico de trabalhos</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Tickets List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Tickets ({userTickets.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredTickets.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum ticket encontrado</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTickets.map((ticket) => {
                    const otherParticipant = getOtherParticipant(ticket)
                    const lastMessage = ticket.messages[ticket.messages.length - 1]

                    return (
                      <div
                        key={ticket.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                          selectedTicketId === ticket.id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {otherParticipant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate">{otherParticipant.name}</p>
                              {getStatusBadge(ticket.status)}
                            </div>
                            <p className="text-sm font-medium text-blue-600 mb-1">{ticket.jobTitle}</p>
                            <p className="text-xs text-gray-600 mb-1">
                              {ticket.jobLocation} • R$ {ticket.jobValue.toLocaleString("pt-BR")}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {lastMessage ? lastMessage.message : "Ticket criado"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={getOtherParticipant(selectedTicket).avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {getOtherParticipant(selectedTicket)
                          .name.split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{getOtherParticipant(selectedTicket).name}</CardTitle>
                      <CardDescription>{selectedTicket.jobTitle}</CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(selectedTicket.status)}
                        <span className="text-xs text-gray-500">
                          R$ {selectedTicket.jobValue.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user.role === "admin" && selectedTicket.status === "completed" && (
                    <Button variant="outline" size="sm" onClick={handleReopenTicket}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reabrir
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.senderId === user?.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium">{message.senderName}</p>
                            {message.senderRole === "admin" && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                          {message.type === "audio" ? (
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4" />
                              <span className="text-sm">Mensagem de áudio</span>
                            </div>
                          ) : (
                            <p>{message.message}</p>
                          )}
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === user?.id ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  {canSendMessage(selectedTicketId) ? (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                        className={isRecording ? "bg-red-100" : ""}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Clock className="h-5 w-5" />
                        <span>Este ticket está {selectedTicket.status === "completed" ? "concluído" : "fechado"}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedTicket.status === "completed"
                          ? "O chat foi bloqueado automaticamente após a conclusão do trabalho"
                          : "Não é possível enviar mensagens neste ticket"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Selecione um ticket</h3>
                <p>Escolha um ticket da lista para visualizar a conversa</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
