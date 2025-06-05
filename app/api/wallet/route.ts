import { NextResponse } from "next/server";
import { getWalletByUserId, createWallet, updateWalletBalance } from "../../../src/models/wallet";
import { createTransaction, listUserTransactions } from "../../../src/models/transaction";
import { getUserById } from "../../../src/models/user";
import { RowDataPacket } from "mysql2";

type Transaction = {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  created_at: string;
  sender_id?: string;
  receiver_id?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se usuário existe
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Busca ou cria carteira
    let wallet = await getWalletByUserId(userId);
    if (!wallet) {
      wallet = await createWallet(userId);
    }

    // Busca transações
    const transactions = await listUserTransactions(userId);
    
    // Mapeia as transações para o formato esperado pelo frontend
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      from_wallet_id: t.from_wallet_id,
      to_wallet_id: t.to_wallet_id,
      sender_id: t.sender_id,
      receiver_id: t.receiver_id,
      amount: Number(t.amount),
      type: t.type,
      status: t.status,
      description: t.description || '',
      created_at: new Date(t.created_at).toISOString()
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar transações" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, amount, description, jobId, status = "completed" } = body;

    if (!userId || !type || !amount || !description) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Verifica se usuário existe
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Busca ou cria carteira
    let wallet = await getWalletByUserId(userId);
    if (!wallet) {
      wallet = await createWallet(userId);
    }

    // Cria transação
    const transaction = await createTransaction({
      sender_id: type === "credit" ? "admin-1" : userId,
      receiver_id: type === "credit" ? userId : "admin-1",
      amount,
      type: type === "credit" ? "deposit" : "withdrawal",
      status,
      description,
      job_id: jobId
    });

    // Atualiza saldo se transação completada
    if (status === "completed") {
      await updateWalletBalance(
        userId,
        type === "credit" ? amount : -amount
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função auxiliar para creditar pagamento do trabalho
export async function creditJobPayment(jobId: string, workerId: string, amount: number) {
  try {
    // Credita o valor para o trabalhador
    const transaction = await createTransaction({
      sender_id: "admin-1",
      receiver_id: workerId,
      amount,
      type: "job_payment",
      status: "completed",
      description: `Pagamento do trabalho #${jobId}`,
      job_id: jobId
    });

    // Atualiza saldo do trabalhador
    await updateWalletBalance(workerId, amount);

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
    });

    return true;
  } catch (error) {
    console.error("Erro ao creditar pagamento:", error);
    return false;
  }
}
