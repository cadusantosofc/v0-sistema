import { NextResponse } from "next/server";
import { getUserByEmail } from "../../../../src/models/user";
import { verifyPassword } from "../../../../src/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Tentativa de login:', { email, password });

    const user = await getUserByEmail(email);
    console.log('Usuário encontrado:', { 
      found: !!user,
      id: user?.id,
      role: user?.role,
      storedHash: user?.password
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    console.log('Senha válida:', isValid);

    return NextResponse.json({
      success: isValid,
      user: isValid ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error('Erro no teste de login:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
