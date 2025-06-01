import { NextResponse } from "next/server"
import { hasBalance, getWallet } from "@/lib/wallet"

// Mock de solicitações - substituir por banco de dados real
let mockRequests = [
  {
    id: "1",
    userId: "company-1",
    userName: "Tech Corp",
    type: "recharge",
    amount: 1000,
    receiptUrl: "/uploads/receipt-1.jpg",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    userId: "worker-1",
    userName: "João Silva",
    type: "withdrawal",
    amount: 500,
    pixKey: "joao@example.com",
    status: "pending",
    createdAt: new Date().toISOString()
  }
]

export async function GET(request: Request) {
  try {
    // Adiciona saldo atual para cada solicitação
    const requestsWithBalance = mockRequests.map(req => ({
      ...req,
      wallet: {
        balance: getWallet(req.userId)
      }
    }))

    return NextResponse.json(requestsWithBalance)
  } catch (error) {
    console.error("Erro ao listar solicitações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validações básicas
    if (!data.userId || !data.type || !data.amount) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Valida tipo
    if (!["withdrawal", "recharge"].includes(data.type)) {
      return NextResponse.json(
        { error: "Tipo de operação inválido" },
        { status: 400 }
      )
    }

    // Valida valor
    if (data.amount <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser maior que zero" },
        { status: 400 }
      )
    }

    // Para saque, verifica se tem saldo suficiente
    if (data.type === "withdrawal" && !hasBalance(data.userId, data.amount)) {
      const balance = getWallet(data.userId)
      return NextResponse.json(
        { 
          error: "Saldo insuficiente",
          balance
        },
        { status: 400 }
      )
    }

    // Cria nova solicitação
    const newRequest = {
      id: String(mockRequests.length + 1),
      status: "pending",
      createdAt: new Date().toISOString(),
      ...data
    }

    mockRequests.push(newRequest)

    return NextResponse.json({
      request: newRequest,
      wallet: {
        balance: getWallet(data.userId)
      }
    })
  } catch (error) {
    console.error("Erro ao criar solicitação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { requestId, status, adminId } = body

    if (!requestId || !status || !adminId) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Encontra a solicitação
    const requestIndex = mockRequests.findIndex(req => req.id === requestId)
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    const request = mockRequests[requestIndex]

    // Atualiza o status
    mockRequests[requestIndex] = {
      ...request,
      status,
      processedAt: new Date().toISOString(),
      processedBy: adminId
    }

    // Se aprovado, cria a transação na carteira
    if (status === "approved") {
      // Aqui você chamaria a função para criar a transação
      // e atualizar o saldo da carteira
      await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: request.userId,
          type: request.type === "withdrawal" ? "debit" : "credit",
          amount: request.amount,
          description: request.type === "withdrawal" 
            ? "Saque via PIX"
            : "Recarga via PIX",
          status: "completed"
        })
      })
    }

    return NextResponse.json(mockRequests[requestIndex])
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
