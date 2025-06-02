import { NextResponse } from 'next/server';
import { getBalance, updateBalance } from '@/data/wallets';

// GET /api/wallet/[userId]
export async function GET(
  request: Request,
  context: { params: { userId: string } }
) {
  const { userId } = context.params

  if (!userId) {
    return NextResponse.json(
      { error: 'ID do usuário é obrigatório' },
      { status: 400 }
    )
  }

  try {
    const balance = await getBalance(userId);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error(`Erro ao ler carteira ${userId}:`, error)
    return NextResponse.json(
      { error: 'Erro ao carregar saldo' },
      { status: 500 }
    )
  }
}

// PATCH /api/wallet/[userId]
export async function PATCH(
  request: Request,
  context: { params: { userId: string } }
) {
  const { userId } = context.params

  if (!userId) {
    return NextResponse.json(
      { error: 'ID do usuário é obrigatório' },
      { status: 400 }
    )
  }

  try {
    const { amount } = await request.json();
    
    // Não permite saldo negativo
    const currentBalance = await getBalance(userId);
    if (currentBalance + Number(amount) < 0) {
      return NextResponse.json(
        { error: 'Saldo não pode ficar negativo' },
        { status: 400 }
      )
    }

    const success = await updateBalance(userId, Number(amount));
    
    if (success) {
      const newBalance = await getBalance(userId);
      return NextResponse.json({ balance: newBalance });
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar saldo' },
      { status: 500 }
    );
  } catch (error) {
    console.error(`Erro ao atualizar carteira ${userId}:`, error)
    return NextResponse.json(
      { error: 'Erro ao atualizar saldo' },
      { status: 500 }
    )
  }
}
