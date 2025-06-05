import { NextRequest, NextResponse } from "next/server";
import { listPendingWalletRequests, approveWalletRequest, rejectWalletRequest } from "@/src/models/wallet-request";
import { getUserFromCookie } from "@/src/lib/cookies";
import { getUserById } from "@/src/models/user";
import { getWalletByUserId } from "@/src/models/wallet";

// Listar solicitações pendentes
export async function GET() {
  try {
    // Pegar usuário do cookie
    const cookieData = await getUserFromCookie();
    if (!cookieData?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar usuário pelo ID do cookie
    const user = await getUserById(cookieData.id);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Buscar todas as solicitações pendentes
    const requests = await listPendingWalletRequests();
    
    // Adicionar informações de saldo para cada usuário
    const requestsWithBalance = await Promise.all(
      requests.map(async (req) => {
        const wallet = await getWalletByUserId(req.user_id);
        return {
          ...req,
          current_balance: wallet?.balance || 0
        };
      })
    );

    return NextResponse.json(requestsWithBalance);
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    return NextResponse.json(
      { error: "Erro ao listar solicitações" },
      { status: 500 }
    );
  }
}

// Aprovar ou rejeitar solicitação
export async function POST(request: NextRequest) {
  try {
    const cookieData = await getUserFromCookie();
    if (!cookieData?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await getUserById(cookieData.id);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const { id, action } = data;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    let result;
    if (action === "approve") {
      // Aprovar solicitação e atualizar saldo
      result = await approveWalletRequest(id, user.id);
      
      if (!result.request) {
        return NextResponse.json(
          { error: "Solicitação não encontrada ou já processada" },
          { status: 404 }
        );
      }
      
    } else if (action === "reject") {
      // Rejeitar solicitação
      const rejectedRequest = await rejectWalletRequest(id, user.id);
      
      if (!rejectedRequest) {
        return NextResponse.json(
          { error: "Solicitação não encontrada" },
          { status: 404 }
        );
      }
      
      // Buscar saldo atual do usuário
      const wallet = await getWalletByUserId(rejectedRequest.user_id);
      
      result = {
        request: rejectedRequest,
        wallet: {
          balance: wallet?.balance || 0
        }
      };
    } else {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
