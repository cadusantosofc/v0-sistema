import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/wallet/refund
export async function POST(request: Request) {
  try {
    const { userId, amount, jobId, description, isAdmin } = await request.json();
    
    console.log(`Processando reembolso: userId=${userId}, amount=${amount}, jobId=${jobId}, admin=${isAdmin ? 'sim' : 'não'}`);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      );
    }
    
    // Caminho do arquivo de carteiras
    const WALLETS_FILE = path.join(process.cwd(), "data", "wallets", "users.txt");
    
    // Verifica se o arquivo existe
    if (!fs.existsSync(WALLETS_FILE)) {
      console.error('Arquivo de carteiras não encontrado');
      return NextResponse.json(
        { error: 'Arquivo de carteiras não encontrado' },
        { status: 500 }
      );
    }
    
    try {
      // Lê o arquivo de carteiras
      let content = fs.readFileSync(WALLETS_FILE, 'utf-8');
      console.log('Conteúdo atual do arquivo de carteiras:', content);
      
      // Processa o conteúdo
      const wallets = new Map<string, number>();
      content.split('\n').forEach(line => {
        if (!line.trim()) return;
        const [id, balanceStr] = line.split('|');
        if (!id || !id.trim()) return;
        
        const balance = parseFloat(balanceStr);
        if (!isNaN(balance)) {
          wallets.set(id.trim(), balance);
        } else {
          wallets.set(id.trim(), 0);
        }
      });
      
      // Obtém o saldo atual
      const currentBalance = wallets.get(userId) || 0;
      console.log(`Saldo atual do usuário ${userId}: R$ ${currentBalance}`);
      
      // Calcula novo saldo
      const newBalance = currentBalance + amount;
      console.log(`Novo saldo após reembolso: R$ ${newBalance}`);
      
      // Se for ação administrativa, registra a comissão retida
      if (isAdmin) {
        console.log(`AÇÃO ADMINISTRATIVA: Reembolso parcial com comissão retida de R$10.00 para vaga ${jobId}`);
      }
      
      // Atualiza o mapa de carteiras
      wallets.set(userId, newBalance);
      
      // Converte de volta para string
      const newContent = Array.from(wallets.entries())
        .map(([id, balance]) => `${id}|${balance}`)
        .join('\n');
      
      // Salva o arquivo
      fs.writeFileSync(WALLETS_FILE, newContent, 'utf-8');
      console.log('Arquivo de carteiras atualizado com sucesso');
      
      return NextResponse.json({
        success: true,
        balance: newBalance,
        message: 'Reembolso processado com sucesso',
        isAdmin: isAdmin || false,
        commissionRetained: isAdmin ? 10 : 0
      });
    } catch (error) {
      console.error('Erro ao processar arquivo de carteiras:', error);
      return NextResponse.json(
        { error: 'Erro ao processar arquivo de carteiras' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro no endpoint de reembolso:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar reembolso' },
      { status: 500 }
    );
  }
} 