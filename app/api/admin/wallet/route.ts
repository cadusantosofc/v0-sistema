import { NextResponse } from 'next/server';
import { getWalletByUserId, updateWalletBalance } from '../../../../src/models/wallet';
import { createTransaction } from '../../../../src/models/transaction';
import { getUserById } from '../../../../src/models/user';

// POST /api/admin/wallet
export async function POST(request: Request) {
  try {
    const { userId, amount, type, description } = await request.json();

    // Verifica se o usuário existe
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Lê carteira atual
    const wallet = await getWalletByUserId(userId);
    if (!wallet) {
      return NextResponse.json(
        { error: 'Carteira não encontrada' },
        { status: 404 }
      );
    }

    // Calcula novo saldo
    const newBalance = type === 'add' 
      ? wallet.balance + amount
      : wallet.balance - amount;

    // Não permite saldo negativo
    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Saldo não pode ficar negativo' },
        { status: 400 }
      );
    }

    // Atualiza saldo
    const updatedWallet = await updateWalletBalance(userId, type === 'add' ? amount : -amount);
    if (!updatedWallet) {
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 }
      );
    }

    // Cria transação
    const transaction = await createTransaction({
      sender_id: type === 'add' ? 'admin-1' : userId,
      receiver_id: type === 'add' ? userId : 'admin-1',
      amount: amount,
      type: type === 'add' ? 'deposit' : 'withdrawal',
      status: 'completed',
      description: description || `${type === 'add' ? 'Depósito' : 'Saque'} administrativo`
    });

    return NextResponse.json({
      success: true,
      balance: updatedWallet.balance,
      transaction
    });
  } catch (error) {
    console.error('Erro ao atualizar carteira:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar carteira' },
      { status: 500 }
    );
  }
}
