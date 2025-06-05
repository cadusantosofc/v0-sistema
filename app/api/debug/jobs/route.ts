import { NextResponse } from 'next/server';
import { pool } from '../../../../src/lib/db';

export async function GET() {
  try {
    // Verifica se a tabela jobs existe
    const [tables] = await pool.query(
      "SHOW TABLES LIKE 'jobs'"
    ) as any;

    if (tables.length === 0) {
      return NextResponse.json(
        { error: 'Tabela jobs não encontrada' },
        { status: 404 }
      );
    }

    // Conta o número de vagas
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM jobs'
    ) as any;
    
    const count = countResult[0].count;
    
    // Pega algumas vagas de exemplo
    const [jobs] = await pool.query(
      'SELECT id, title, status, company_id, created_at FROM jobs LIMIT 10'
    ) as any;

    return NextResponse.json({
      tableExists: true,
      jobsCount: count,
      sampleJobs: jobs
    });
  } catch (error) {
    console.error('Erro ao verificar tabela jobs:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar tabela jobs', details: String(error) },
      { status: 500 }
    );
  }
}
