import { NextResponse } from "next/server"
import { processOperation, getWallet } from "@/lib/wallet"

export async function POST(request: Request) {
  try {
    const { userId, type, amount, description } = await request.json()

    // Validações
    if (!userId || !type || !amount || !description) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Valida tipo
    if (!["credit", "debit"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo de operação inválido" },
        { status: 400 }
      )
    }

    // Valida valor
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser maior que zero" },
        { status: 400 }
      )
    }

    // Processa operação
    const result = processOperation(userId, type as "credit" | "debit", amount)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      userId,
      wallet: {
        balance: result.balance
      },
      operation: {
        type,
        amount,
        description,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Erro ao processar operação manual:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
