import { NextResponse } from "next/server";
import { hashPassword } from "../../../../src/lib/auth";
import { pool } from "../../../../src/lib/db";

export async function GET() {
  try {
    // Gera o hash correto
    const password = "admin123";
    const hashedPassword = await hashPassword(password);
    console.log('Hash gerado:', hashedPassword);

    // Atualiza todos os usuários com o novo hash
    await pool.execute(
      'UPDATE users SET password = ?',
      [hashedPassword]
    );

    return NextResponse.json({ 
      message: "Senhas atualizadas com sucesso",
      hash: hashedPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar senhas:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
