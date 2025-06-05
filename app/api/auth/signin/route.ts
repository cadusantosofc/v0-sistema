import { NextResponse } from "next/server";
import { getUserByEmail } from "../../../../src/models/user";
import { verifyPassword, sanitizeUser } from "../../../../src/lib/auth";
import { resetPool } from "../../../../src/lib/db";

// Função auxiliar para tentar login com retry
async function tryLogin(email: string, password: string, maxRetries = 3) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      console.log(`Tentativa de login ${retries + 1}/${maxRetries} para ${email}`);
      
      // Buscar usuário pelo email
      const user = await getUserByEmail(email);
      
      if (!user) {
        console.log('Usuário não encontrado');
        return { success: false, error: "Credenciais inválidas", status: 401 };
      }
      
      // Verificar senha
      const isValidPassword = await verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        console.log('Senha incorreta');
        return { success: false, error: "Credenciais inválidas", status: 401 };
      }
      
      // Remove senha do retorno
      const userWithoutPassword = sanitizeUser(user);
      console.log('Login bem sucedido:', { userId: user.id, role: user.role });
      
      return { 
        success: true, 
        user: userWithoutPassword
      };
    } catch (error: any) {
      lastError = error;
      console.error(`Erro na tentativa ${retries + 1}/${maxRetries}:`, error);
      
      // Se for erro de conexão, tenta resetar o pool depois da segunda tentativa
      if (error.code === 'ER_CON_COUNT_ERROR' && retries >= 1) {
        try {
          console.log('Tentando resetar o pool de conexões...');
          await resetPool();
        } catch (resetError) {
          console.error('Erro ao resetar pool:', resetError);
        }
      }
      
      // Backoff exponencial
      const waitTime = Math.pow(2, retries) * 1000;
      console.log(`Aguardando ${waitTime}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      retries++;
    }
  }
  
  console.error(`Todas as ${maxRetries} tentativas de login falharam`);
  return { 
    success: false, 
    error: "Erro interno do servidor. Tente novamente.", 
    details: lastError?.message || "Erro desconhecido",
    status: 500 
  };
}

export async function POST(request: Request) {
  try {
    console.log('=== Iniciando POST /api/auth/signin ===');
    const body = await request.json();
    console.log('Body recebido:', body);
    
    const { email, password } = body;
    console.log('Dados extraídos:', { email, password });
    
    if (!email || !password) {
      console.log('Email ou senha faltando');
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await tryLogin(email, password);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
