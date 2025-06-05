import { NextResponse } from 'next/server';
import { resetPool } from '@/src/lib/db';

// Endpoint especial para resetar conexões do banco de dados em caso de emergência
export async function GET(request: Request) {
  console.log('Solicitação recebida para resetar pool de conexões');
  
  try {
    const success = await resetPool();
    
    if (success) {
      console.log('Pool de conexões resetado com sucesso');
      return NextResponse.json({ 
        success: true, 
        message: 'Pool de conexões resetado com sucesso' 
      });
    } else {
      console.error('Falha ao resetar pool de conexões');
      return NextResponse.json(
        { success: false, message: 'Falha ao resetar pool de conexões' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao resetar pool de conexões:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao resetar pool de conexões', error },
      { status: 500 }
    );
  }
} 