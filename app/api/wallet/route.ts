import { NextResponse } from "next/server"

// Mock de dados - substituir por banco de dados real
const wallets = [
  {
    id: "1",
    userId: "user1",
    balance: 0,
    transactions: []
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      )
    }

    // Encontra ou cria carteira
    let wallet = wallets.find(w => w.userId === userId)
    if (!wallet) {
      wallet = {
        id: Math.random().toString(36).substring(7),
        userId,
        balance: 0,
        transactions: []
      }
      wallets.push(wallet)
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error("Erro ao buscar carteira:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, amount, description, jobId, status = "completed" } = body

    if (!userId || !type || !amount || !description) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Encontra ou cria carteira
    let wallet = wallets.find(w => w.userId === userId)
    if (!wallet) {
      wallet = {
        id: Math.random().toString(36).substring(7),
        userId,
        balance: 0,
        transactions: []
      }
      wallets.push(wallet)
    }

    // Cria transação
    const transaction = {
      id: Math.random().toString(36).substring(7),
      type,
      amount,
      description,
      jobId,
      status,
      createdAt: new Date().toISOString()
    }

    // Adiciona transação e atualiza saldo
    wallet.transactions.unshift(transaction)
    if (status === "completed") {
      wallet.balance += type === "credit" ? amount : -amount
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Erro ao criar transação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Função auxiliar para creditar pagamento do trabalho
export async function creditJobPayment(jobId: string, workerId: string, amount: number) {
  try {
    // Credita o valor para o trabalhador
    await fetch("/api/wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: workerId,
        type: "credit",
        amount,
        description: `Pagamento do trabalho #${jobId}`,
        jobId,
        status: "completed"
      })
    })

    // Notifica o trabalhador
    await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: workerId,
        type: "payment",
        title: "Pagamento Recebido",
        message: `Você recebeu R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} pelo trabalho #${jobId}`,
        data: { jobId, amount }
      })
    })

    return true
  } catch (error) {
    console.error("Erro ao creditar pagamento:", error)
    return false
  }
}
