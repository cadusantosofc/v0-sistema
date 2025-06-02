import { NextResponse } from "next/server"
import { createChat, getChat, getMessages, addMessage, getChatsByUser, getChatsByJob } from "@/data/chats"

export async function POST(request: Request) {
  try {
    const { jobId, companyId, workerId, companyName, workerName, jobTitle } = await request.json()

    // Cria um novo chat
    const chat = await createChat({
      jobId,
      companyId,
      workerId,
      companyName,
      workerName,
      jobTitle
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Erro ao criar chat:', error)
    return NextResponse.json(
      { error: "Erro ao criar chat" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const userId = searchParams.get('userId')
    const jobId = searchParams.get('jobId')

    if (chatId) {
      // Busca um chat específico e suas mensagens
      const [chat, messages] = await Promise.all([
        getChat(chatId),
        getMessages(chatId)
      ])

      if (!chat) {
        return NextResponse.json(
          { error: "Chat não encontrado" },
          { status: 404 }
        )
      }

      return NextResponse.json({ chat, messages })
    } 
    else if (userId) {
      // Busca todos os chats do usuário
      const chats = await getChatsByUser(userId)
      return NextResponse.json({ chats })
    }
    else if (jobId) {
      // Busca todos os chats da vaga
      const chats = await getChatsByJob(jobId)
      return NextResponse.json({ chats })
    }

    return NextResponse.json(
      { error: "Parâmetro chatId, userId ou jobId é obrigatório" },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao buscar chat:', error)
    return NextResponse.json(
      { error: "Erro ao buscar chat" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { chatId, senderId, senderName, senderRole, content } = await request.json()

    // Adiciona uma nova mensagem
    const message = await addMessage({
      chatId,
      senderId,
      senderName,
      senderRole,
      content
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 500 }
    )
  }
}
