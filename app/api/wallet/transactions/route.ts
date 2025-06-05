import { NextResponse } from 'next/server';
import { listUserTransactions, createTransaction } from '../../../../src/models/transaction';
import { getUserById } from '../../../../src/models/user';
import { updateWalletBalance } from '../../../../src/models/wallet';

// GET /api/wallet/transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Verifica se userId foi fornecido
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verifica se usuário existe
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Busca transações do usuário
    const transactions = await listUserTransactions(userId);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Erro ao ler transações:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar transações' },
      { status: 500 }
    );
  }
}

// POST /api/wallet/transactions
export async function POST(request: Request) {
  try {
    const { userId, type, amount, description, jobId } = await request.json();

    // Validações básicas
    if (!userId || !type || !amount) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Verifica se usuário existe
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Cria transação
    const transaction = await createTransaction({
      sender_id: type === 'withdrawal' ? userId : 'admin-1',
      receiver_id: type === 'withdrawal' ? 'admin-1' : userId,
      amount,
      type: type === 'withdrawal' ? 'withdrawal' : 'deposit',
      status: 'completed',
      description: description || `${type === 'withdrawal' ? 'Saque' : 'Depósito'} manual`
    });

    // Atualiza saldo
    await updateWalletBalance(
      userId,
      type === 'withdrawal' ? -amount : amount
    );

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar transação' },
      { status: 500 }
    );
  }
}
