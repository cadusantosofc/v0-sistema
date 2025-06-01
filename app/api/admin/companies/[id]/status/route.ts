import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    // Aqui você deve atualizar o status da empresa no banco de dados
    // Por enquanto apenas retorna sucesso
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar status da empresa" },
      { status: 500 }
    )
  }
}
