import { NextResponse } from "next/server"
import { hasBalance, getWallet } from "@/lib/wallet"
import { createWalletRequest, getUserWalletRequests } from "@/src/models/wallet-request"
import { getUserFromCookie } from "@/src/lib/cookies"
import { getUserById } from "@/src/models/user"

// Tabela de solicitações no banco
// CREATE TABLE wallet_requests (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   user_id VARCHAR(255) NOT NULL,
//   user_name VARCHAR(255) NOT NULL,
//   type ENUM('withdrawal', 'recharge') NOT NULL,
//   amount DECIMAL(10,2) NOT NULL,
//   pix_key VARCHAR(255),
//   receipt_url VARCHAR(255),
//   status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   processed_at TIMESTAMP,
//   processed_by VARCHAR(255),
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const cookieData = await getUserFromCookie();
    if (!cookieData?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || cookieData.id

    // Se não for o próprio usuário ou admin, rejeitar
    if (userId !== cookieData.id) {
      const user = await getUserById(cookieData.id);
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }

    // Buscar solicitações do usuário
    const requests = await getUserWalletRequests(userId);

    return NextResponse.json(requests);
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
    // Verificar autenticação
    const cookieData = await getUserFromCookie();
    if (!cookieData?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const data = await request.json()

    // Validações básicas
    if (!data.userId || !data.type || !data.amount || !data.userName) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Verificar se o usuário está criando para si mesmo
    if (data.userId !== cookieData.id) {
      const user = await getUserById(cookieData.id);
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
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
    if (data.type === "withdrawal") {
      const hasEnoughBalance = await hasBalance(data.userId, data.amount)
      if (!hasEnoughBalance) {
        const wallet = await getWallet(data.userId)
        return NextResponse.json(
          { 
            error: "Saldo insuficiente",
            balance: wallet?.balance || 0
          },
          { status: 400 }
        )
      }

      // Para saque, verifica se tem chave PIX
      if (!data.pixKey) {
        return NextResponse.json(
          { error: "Chave PIX é obrigatória para saques" },
          { status: 400 }
        )
      }
    }

    // Para recarga, verifica se tem comprovante
    if (data.type === "recharge" && !data.receiptUrl) {
      return NextResponse.json(
        { error: "Comprovante é obrigatório para recargas" },
        { status: 400 }
      )
    }

    // Cria nova solicitação
    const newRequest = await createWalletRequest(
      data.userId,
      data.userName,
      data.type === "withdrawal" ? "withdrawal" : "deposit",
      data.amount,
      data.pixKey,
      data.receiptUrl
    );

    // Busca o saldo atual
    const wallet = await getWallet(data.userId);

    return NextResponse.json({
      request: newRequest,
      wallet: {
        balance: wallet?.balance || 0
      }
    });
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
    const [requests] = await pool.query(
      'SELECT * FROM wallet_requests WHERE id = ?',
      [requestId]
    )

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    const walletRequest = requests[0]

    // Atualiza o status
    await pool.query(
      `UPDATE wallet_requests 
       SET status = ?, processed_at = NOW(), processed_by = ? 
       WHERE id = ?`,
      [status, adminId, requestId]
    )

    // Se aprovado, atualiza o saldo da carteira
    if (status === "approved") {
      await updateBalance(
        walletRequest.user_id,
        walletRequest.amount,
        walletRequest.type === "withdrawal" ? "debit" : "credit"
      )
    }

    const [updatedRequest] = await pool.query(
      'SELECT * FROM wallet_requests WHERE id = ?',
      [requestId]
    )

    return NextResponse.json(
      Array.isArray(updatedRequest) ? updatedRequest[0] : updatedRequest
    )
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
