import { NextResponse } from "next/server";
import { pool } from "../../../../src/lib/db";

export async function GET() {
  try {
    const [users] = await pool.execute('SELECT id, email, password, role FROM users');
    console.log('Usuários encontrados:', users);
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
