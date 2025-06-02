"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, Mic, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { useRealtime } from "@/lib/realtime-context"

type Chat = {
  id: string
  jobId: string
  companyId: string
  workerId: string
  companyName: string
  workerName: string
  jobTitle: string
  status: "active" | "closed"
  createdAt: string
  updatedAt: string
}

type Message = {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderRole: "admin" | "company" | "worker"
  content: string
  timestamp: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { forceUpdate } = useRealtime()
  const searchParams = useSearchParams()
  const [selectedChatId, setSelectedChatId] = useState<string>("")
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Busca chats do usuário
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/chat?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setChats(data.chats || []))
        .catch(console.error)
    }
  }, [user?.id])

  // Busca mensagens do chat selecionado
  useEffect(() => {
    if (selectedChatId) {
      fetch(`/api/chat?chatId=${selectedChatId}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data.messages || [])
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
          }
        })
        .catch(console.error)
    }
  }, [selectedChatId])

  // Get chat from URL parameter
  useEffect(() => {
    const chatId = searchParams.get("chat")
    if (chatId) {
      setSelectedChatId(chatId)
    }
  }, [searchParams])

  const filteredChats = chats.filter(
    (chat) =>
      chat.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.workerName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedChat = chats.find(chat => chat.id === selectedChatId)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || !user) return

    try {
      const response = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChatId,
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        // Atualiza lista de mensagens
        const data = await response.json()
        setMessages(prev => [...prev, data])

        // Notifica outros participantes
        const selectedChat = chats.find(chat => chat.id === selectedChatId)
        if (selectedChat) {
          const otherParticipantId = selectedChat.workerId === user.id ? selectedChat.companyId : selectedChat.workerId
          addNotification({
            userId: otherParticipantId,
            type: "message",
            title: "Nova Mensagem",
            message: `${user.name}: ${newMessage.trim()}`,
            read: false,
            link: `/chat?chat=${selectedChatId}`,
            data: { chatId: selectedChatId },
          })
        }

        setNewMessage("")
        forceUpdate()

        // Rola para última mensagem
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReopenChat = async () => {
    if (!user || user.role !== "admin" || !selectedChatId) return

    try {
      const response = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChatId,
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          content: "Chat reaberto pelo administrador",
          type: "system"
        })
      })

      if (response.ok) {
        // Atualiza lista de mensagens
        const data = await response.json()
        setMessages(prev => [...prev, data])

        // Notifica participantes
        const selectedChat = chats.find(chat => chat.id === selectedChatId)
        if (selectedChat) {
          [selectedChat.companyId, selectedChat.workerId].forEach((participantId) => {
            addNotification({
              userId: participantId,
              type: "system",
              title: "Chat Reaberto",
              message: `O chat da vaga "${selectedChat.jobTitle}" foi reaberto pelo administrador`,
              read: false,
              link: `/chat?chat=${selectedChatId}`,
              data: { chatId: selectedChatId },
            })
          })
        }

        forceUpdate()
      }
    } catch (error) {
      console.error('Erro ao reabrir chat:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100">Ativo</Badge>
      case "closed":
        return <Badge className="bg-red-100">Fechado</Badge>
      default:
        return null
    }
  }

  const getOtherParticipant = (chat: any) => {
    if (user?.role === "company") {
      return chat.workerName
    } else if (user?.role === "worker") {
      return chat.companyName
    } else {
      return `${chat.companyName} - ${chat.workerName}`
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
        <h1 className="text-3xl font-bold">Sistema de Chat</h1>
        <p className="text-gray-600">Gerencie suas conversas e histórico de trabalhos</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chats ({chats.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredChats.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Nenhum chat encontrado</h3>
                  <p>Não encontramos nenhum chat com os critérios informados</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-4">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent",
                        selectedChatId === chat.id && "bg-accent",
                      )}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{chat.jobTitle}</span>
                          {getStatusBadge(chat.status)}
                        </div>
                        <span className="text-muted-foreground">{getOtherParticipant(chat)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b px-6 py-3">
                <div className="flex flex-col">
                  <h3 className="font-semibold">{selectedChat.jobTitle}</h3>
                  <span className="text-sm text-muted-foreground">
                    {getOtherParticipant(selectedChat)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedChat.status)}
                  {user?.role === "admin" && selectedChat.status === "closed" && (
                    <Button size="sm" onClick={handleReopenChat}>
                      Reabrir
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.senderId === user?.id
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <span className="font-medium">{message.senderName}</span>
                      <span>{message.content}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2 border-t p-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(isRecording && "text-destructive")}
                  onClick={() => setIsRecording(!isRecording)}
                  disabled={!selectedChatId || selectedChat?.status === "closed"}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedChatId || selectedChat?.status === "closed"}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!selectedChatId || selectedChat?.status === "closed"}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Selecione um chat</h3>
                <p>Escolha um chat da lista para visualizar a conversa</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
