import { NextResponse } from "next/server"

// Mock de chat
const mockChat = {
  id: "1",
  companyId: "1",
  workerId: "1",
  jobId: "1",
  company: {
    name: "Tech Corp",
    avatar: ""
  },
  worker: {
    name: "João Silva",
    avatar: ""
  },
  job: {
    title: "Desenvolvedor Full Stack"
  },
  messages: [
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
  ],
  createdAt: "2023-01-01T00:00:00.000Z"
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Aqui você deve buscar o chat do banco de dados
    return NextResponse.json(mockChat)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar chat" },
      { status: 500 }
    )
  }
}
