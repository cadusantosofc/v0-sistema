import { NextResponse } from 'next/server';
import { getWalletByUserId, createWallet, addToWalletBalance } from '../../../../src/models/wallet';

// GET /api/wallet/:userId
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  console.log(`GET /api/wallet/${params.userId}`);
  
  if (!params.userId) {
    return NextResponse.json(
      { error: 'ID do usuário é obrigatório' },
      { status: 400 }
    );
  }

  try {
    // Busca a carteira do usuário
    let wallet = await getWalletByUserId(params.userId);
    
    // Se não existir, cria uma nova carteira
    if (!wallet) {
      console.log(`Carteira não encontrada para ${params.userId}. Criando nova carteira...`);
      wallet = await createWallet(params.userId);
    }

    console.log(`Carteira encontrada: ${wallet.id}, saldo: ${wallet.balance}`);
    
    // Converte o saldo para número e formata para duas casas decimais
    const balance = parseFloat(wallet.balance.toString());
    
    return NextResponse.json({
      wallet_id: wallet.id,
      user_id: wallet.user_id,
      balance: balance,
      status: wallet.status,
      created_at: wallet.created_at,
      updated_at: wallet.updated_at
    });
  } catch (error) {
    console.error('Erro ao buscar carteira:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar carteira' },
      { status: 500 }
    );
  }
}

// PATCH /api/wallet/:userId
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  console.log(`PATCH /api/wallet/${params.userId}`);
  
  if (!params.userId) {
    return NextResponse.json(
      { error: 'ID do usuário é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const { amount } = await request.json();
    
    if (amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json(
        { error: 'Valor (amount) inválido' },
        { status: 400 }
      );
    }

    // Converte o valor para número
    const numericAmount = parseFloat(amount.toString());
    console.log(`Adicionando ${numericAmount} ao saldo da carteira do usuário ${params.userId}`);

    try {
      // Adiciona o valor ao saldo da carteira
      const updatedWallet = await addToWalletBalance(params.userId, numericAmount);
      
      if (!updatedWallet) {
        throw new Error('Falha ao atualizar carteira');
      }
      
      // Converte o saldo para número
      const newBalance = parseFloat(updatedWallet.balance.toString());
      console.log(`Saldo atualizado para: ${newBalance}`);
      
      return NextResponse.json({
        wallet_id: updatedWallet.id,
        user_id: updatedWallet.user_id,
        balance: newBalance,
        status: updatedWallet.status,
        created_at: updatedWallet.created_at,
        updated_at: updatedWallet.updated_at
      });
    } catch (error) {
      // Captura erros específicos da atualização de saldo
      if (error instanceof Error && error.message === 'Saldo insuficiente') {
        return NextResponse.json(
          { error: 'Saldo insuficiente para esta operação' },
          { status: 400 }
        );
      }
      
      // Repassar o erro
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar carteira:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar carteira';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
