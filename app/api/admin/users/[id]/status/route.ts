import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    // Aqui você deve atualizar o status do usuário no banco de dados
    // Por enquanto apenas retorna sucesso
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar status do usuário" },
      { status: 500 }
    )
  }
}
