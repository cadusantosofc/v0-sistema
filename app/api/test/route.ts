import { NextResponse } from "next/server";
import { pool } from "../../../src/lib/db";

export async function GET() {
  try {
    console.log('Variáveis de ambiente:', {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT
    });

    // Testa conexão com o banco
    const [result] = await pool.execute('SELECT 1');
    console.log('Teste de conexão:', result);

    return NextResponse.json({ 
      message: "Conexão OK",
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT
      }
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const connection = await pool.getConnection();
    try {
      const testJob = {
        title: 'Teste API SQL',
        description: 'Teste de inserção via API',
        requirements: 'Testar SQL',
        salary_range: '1000-2000',
        location: 'TesteCity',
        type: 'full_time',
        category: 'TI',
        status: 'open',
        company_id: 'company-test',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const [result] = await connection.query(
        'INSERT INTO jobs SET ?',
        [testJob]
      );
      await connection.release();
      return NextResponse.json({ success: true, result });
    } catch (error: any) {
      await connection.release();
      return NextResponse.json({ success: false, error: error.message, code: error.code, sql: error.sql }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
