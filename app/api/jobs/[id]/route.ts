import { NextResponse } from 'next/server';
import { pool } from '../../../../src/lib/db';
import { getUserById } from '../../../../src/models/user';

// Função auxiliar para buscar vaga por ID
async function getJobById(id: string) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM jobs WHERE id = ?',
      [id]
    ) as unknown as [any[]];
    return rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    return null;
  }
}

// PUT /api/jobs/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`\n=== INÍCIO DA REQUISIÇÃO PUT /api/jobs/${params.id} ===`);
  
  try {
    const jobId = params.id;
    const data = await request.json();
    
    console.log('Dados recebidos para atualização:', {
      jobId,
      ...data
    });

    // Verifica se o usuário é admin
    const userRole = data.userRole;
    const isAdmin = userRole === 'admin';
    
    // Primeiro, verifica se a vaga existe
    const job = await getJobById(jobId);
    if (!job) {
      console.log(`Vaga com ID ${jobId} não encontrada`);
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Verifica permissões (apenas empresa dona ou admin pode editar)
    if (!isAdmin && data.userId !== job.company_id) {
      console.log(`Usuário ${data.userId} não tem permissão para editar a vaga ${jobId}`);
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta vaga' },
        { status: 403 }
      );
    }

    // Verifica restrições para não-admins
    if (!isAdmin && (job.status === 'in_progress' || job.status === 'completed')) {
      console.log(`Tentativa de editar vaga ${jobId} com status ${job.status} por usuário não-admin`);
      return NextResponse.json(
        { error: 'Não é possível editar vagas em andamento ou concluídas' },
        { status: 403 }
      );
    }

    // Registra ações administrativas
    if (isAdmin) {
      console.log(`AÇÃO ADMINISTRATIVA: Edição de vaga ${jobId} (${job.title}) por administrador`);
      
      // Se estiver alterando o status, registra isso especialmente
      if (data.status && data.status !== job.status) {
        console.log(`AÇÃO ADMINISTRATIVA: Alteração de status da vaga ${jobId} de '${job.status}' para '${data.status}'`);
      }
    }

    // Remove campos não permitidos para edição
    const updateData = { ...data };
    delete updateData.userRole;
    delete updateData.userId;

    // Atualiza a data de atualização
    updateData.updated_at = new Date().toISOString();

    // Atualiza a vaga
    await pool.query(
      'UPDATE jobs SET ? WHERE id = ?',
      [updateData, jobId]
    );

    console.log(`Vaga ${jobId} atualizada com sucesso`);
    
    // Busca a vaga atualizada
    const updatedJob = await getJobById(jobId);
    
    return NextResponse.json({
      success: true,
      job: updatedJob,
      wasAdmin: isAdmin
    });
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar vaga' },
      { status: 500 }
    );
  } finally {
    console.log(`=== FIM DA REQUISIÇÃO PUT /api/jobs/${params.id} ===\n`);
  }
} 