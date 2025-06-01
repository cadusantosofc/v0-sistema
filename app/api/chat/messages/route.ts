import { NextResponse } from "next/server"

// Mock de mensagens
let messages = [
  {
    id: "1",
    chatId: "1",
    userId: "1",
    content: "Olá! Gostaria de saber mais sobre a vaga.",
    createdAt: "2023-01-01T00:00:00.000Z",
    user: {
      name: "João Silva",
      avatar: ""
    }
  },
  {
    id: "2",
    chatId: "1",
    userId: "2",
    content: "Olá João! Claro, que bom que você se interessou. Podemos marcar uma entrevista?",
    createdAt: "2023-01-01T00:10:00.000Z",
    user: {
      name: "Tech Corp",
      avatar: ""
    }
  }
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chatId, userId, content } = body

    const newMessage = {
      id: String(messages.length + 1),
      chatId,
      userId,
      content,
      createdAt: new Date().toISOString(),
      user: {
        name: userId === "1" ? "João Silva" : "Tech Corp",
        avatar: ""
      }
    }

    messages.push(newMessage)

    return NextResponse.json(newMessage)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 500 }
    )
  }
}
