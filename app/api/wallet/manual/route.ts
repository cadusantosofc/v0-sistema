import { NextResponse } from "next/server"
import { getWalletBalance, updateWalletBalance } from "@/src/models/wallet"
import { createTransaction } from "@/src/models/transaction"

export async function POST(request: Request) {
  try {
    console.log('Iniciando operação manual');
    const { userId, type, amount, description } = await request.json()
    console.log('Dados recebidos:', { userId, type, amount, description });

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
    const currentBalance = await getWalletBalance(userId)

    // Calcula valor da operação
    const operationAmount = type === "credit" ? amount : -amount

    // Valida saldo suficiente para débito
    if (type === "debit" && currentBalance + operationAmount < 0) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      )
    }

    // Cria transação
    console.log('Criando transação...');
    const transaction = await createTransaction({
      userId,
      amount: Math.abs(amount),
      type: type === "credit" ? "deposit" : "withdrawal"
    })
    console.log('Transação criada:', transaction);

    // Lê novo saldo
    const newBalance = await getWalletBalance(userId)
    return NextResponse.json({
      userId,
      wallet: {
        balance: newBalance
      },
      operation: {
        type,
        amount,
        description,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error("Erro ao processar operação manual:", error)
    return NextResponse.json(
      { error: error?.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
