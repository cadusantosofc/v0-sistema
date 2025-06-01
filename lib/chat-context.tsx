"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  read: boolean
}

export interface Chat {
  id: string
  participants: string[]
  participantNames: string[]
  participantAvatars: string[]
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  jobId?: string
  jobTitle?: string
}

interface ChatContextType {
  chats: Chat[]
  messages: ChatMessage[]
  createChat: (
    participants: string[],
    participantNames: string[],
    participantAvatars: string[],
    jobId?: string,
    jobTitle?: string,
  ) => string
  sendMessage: (chatId: string, senderId: string, senderName: string, message: string) => void
  markMessagesAsRead: (chatId: string, userId: string) => void
  getUserChats: (userId: string) => Chat[]
  getChatMessages: (chatId: string) => ChatMessage[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const savedChats = localStorage.getItem("chats")
    const savedMessages = localStorage.getItem("chatMessages")

    if (savedChats) {
      setChats(JSON.parse(savedChats))
    }
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  const createChat = (
    participants: string[],
    participantNames: string[],
    participantAvatars: string[],
    jobId?: string,
    jobTitle?: string,
  ): string => {
    // Check if chat already exists
    const existingChat = chats.find(
      (chat) =>
        chat.participants.length === participants.length && participants.every((p) => chat.participants.includes(p)),
    )

    if (existingChat) {
      return existingChat.id
    }

    const newChat: Chat = {
      id: Date.now().toString(),
      participants,
      participantNames,
      participantAvatars,
      unreadCount: 0,
      jobId,
      jobTitle,
    }

    const updatedChats = [...chats, newChat]
    setChats(updatedChats)
    localStorage.setItem("chats", JSON.stringify(updatedChats))

    return newChat.id
  }

  const sendMessage = (chatId: string, senderId: string, senderName: string, message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))

    // Update chat with last message
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          lastMessage: message,
          lastMessageTime: newMessage.timestamp,
          unreadCount: chat.unreadCount + 1,
        }
      }
      return chat
    })
    setChats(updatedChats)
    localStorage.setItem("chats", JSON.stringify(updatedChats))
  }

  const markMessagesAsRead = (chatId: string, userId: string) => {
    const updatedMessages = messages.map((msg) =>
      msg.chatId === chatId && msg.senderId !== userId ? { ...msg, read: true } : msg,
    )
    setMessages(updatedMessages)
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))

    // Reset unread count for this user
    const updatedChats = chats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat))
    setChats(updatedChats)
    localStorage.setItem("chats", JSON.stringify(updatedChats))
  }

  const getUserChats = (userId: string) => {
    return chats
      .filter((chat) => chat.participants.includes(userId))
      .sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime())
  }

  const getChatMessages = (chatId: string) => {
    return messages
      .filter((msg) => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        createChat,
        sendMessage,
        markMessagesAsRead,
        getUserChats,
        getChatMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
