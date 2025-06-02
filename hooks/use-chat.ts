import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

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

export function useChat() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Busca chats do usuário
  useEffect(() => {
    if (user?.id) {
      setLoading(true)
      fetch(`/api/chat?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setChats(data.chats || []))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [user?.id])

  // Busca mensagens do chat selecionado
  useEffect(() => {
    if (selectedChatId) {
      setLoading(true)
      fetch(`/api/chat?chatId=${selectedChatId}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data.messages || [])
          setError(null)
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [selectedChatId])

  // Envia uma nova mensagem
  const sendMessage = async (content: string) => {
    if (!selectedChatId || !user) return

    try {
      const response = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChatId,
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          content
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data])
        setError(null)
        return data
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Reabre um chat fechado (apenas admin)
  const reopenChat = async () => {
    if (!selectedChatId || !user || user.role !== "admin") return

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
        const data = await response.json()
        setMessages(prev => [...prev, data])
        setError(null)
        return data
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const selectedChat = chats.find(chat => chat.id === selectedChatId)

  return {
    chats,
    messages,
    selectedChat,
    selectedChatId,
    loading,
    error,
    setSelectedChatId,
    sendMessage,
    reopenChat
  }
}
