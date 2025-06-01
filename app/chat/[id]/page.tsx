"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Message {
  id: string
  chatId: string
  userId: string
  content: string
  createdAt: string
  user: {
    name: string
    avatar: string
  }
}

interface Chat {
  id: string
  companyId: string
  workerId: string
  jobId: string
  company: {
    name: string
    avatar: string
  }
  worker: {
    name: string
    avatar: string
  }
  job: {
    title: string
  }
  messages: Message[]
  createdAt: string
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch(`/api/chat/${params.id}`)
        const data = await response.json()
        setChat(data)
      } catch (error) {
        console.error("Erro ao carregar chat:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChat()
  }, [params.id])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chat?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !chat) return

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: message,
          userId: "1" // TODO: usar ID real do usuário
        })
      })

      const newMessage = await response.json()
      setChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null)
      setMessage("")
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="h-10 w-full bg-muted rounded" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 w-full bg-muted rounded" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Chat não encontrado</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <Card className="h-[calc(100vh-8rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={chat.company.avatar} alt={chat.company.name} />
                <AvatarFallback>{chat.company.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{chat.company.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{chat.job.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={chat.worker.avatar} alt={chat.worker.name} />
                <AvatarFallback>{chat.worker.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{chat.worker.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Candidato</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chat.messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.userId === "1" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.user.avatar} alt={message.user.name} />
                  <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 max-w-[70%] ${
                    message.userId === "1"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t flex items-center gap-2"
          >
            <Input
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
