import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, companyId, jobId } = await request.json()

    // Aqui você deve criar uma nova conversa no banco de dados
    // Por enquanto retorna um id mockado
    const chatId = "chat_" + Math.random().toString(36).substr(2, 9)

    return NextResponse.json({ 
      id: chatId,
      userId,
      companyId,
      jobId,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar chat" },
      { status: 500 }
    )
  }
}
