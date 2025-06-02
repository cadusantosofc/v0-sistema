import { NextResponse } from "next/server"
import { getBalance, updateBalance } from "@/data/wallets"

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

    // Lê saldo atual
    const currentBalance = await getBalance(userId)

    // Calcula valor da operação
    const operationAmount = type === "credit" ? amount : -amount

    // Valida saldo suficiente para débito
    if (type === "debit" && currentBalance + operationAmount < 0) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      )
    }

    // Atualiza saldo
    const success = await updateBalance(userId, operationAmount)

    if (!success) {
      return NextResponse.json(
        { error: "Erro ao atualizar saldo" },
        { status: 500 }
      )
    }

    // Lê novo saldo
    const newBalance = await getBalance(userId)
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
