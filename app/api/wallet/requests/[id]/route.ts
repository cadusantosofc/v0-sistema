import { NextResponse } from "next/server"
import { processOperation, getWallet } from "@/lib/wallet"

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await request.json()

    // Valida status
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    // Encontra a solicitação
    const requestIndex = mockRequests.findIndex(req => req.id === id)
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    const walletRequest = mockRequests[requestIndex]

    // Verifica se já foi processada
    if (walletRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Solicitação já foi processada" },
        { status: 400 }
      )
    }

    // Se aprovado, processa a operação
    if (status === "approved") {
      const operationType = walletRequest.type === "withdrawal" ? "debit" : "credit"
      const result = processOperation(
        walletRequest.userId,
        operationType,
        walletRequest.amount
      )

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      // Atualiza o status da solicitação
      mockRequests[requestIndex] = {
        ...walletRequest,
        status,
        processedAt: new Date().toISOString()
      }

      return NextResponse.json({
        request: mockRequests[requestIndex],
        wallet: {
          balance: result.balance
        }
      })
    }

    // Se rejeitado, apenas atualiza o status
    mockRequests[requestIndex] = {
      ...walletRequest,
      status,
      processedAt: new Date().toISOString()
    }

    return NextResponse.json({
      request: mockRequests[requestIndex],
      wallet: {
        balance: getWallet(walletRequest.userId)
      }
    })
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
