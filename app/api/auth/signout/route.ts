import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Em produção, limpar sessão/token
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao fazer logout:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
