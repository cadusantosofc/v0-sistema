import { NextResponse } from 'next/server';
import { createApplication, getApplicationsByWorkerId, getApplicationsByCompanyId, getApplicationById, updateApplicationStatus, deleteApplication } from '../../../src/models/application';
import { getJobById } from '../../../src/models/job';
import { getUserById } from '../../../src/models/user';
import { pool } from '../../../src/lib/db';

// Configuração de cache para 60 segundos
export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const applicationId = searchParams.get('applicationId');
    const jobId = searchParams.get('jobId');

    // Busca candidatura específica
    if (applicationId) {
      const application = await getApplicationById(applicationId);
      if (!application) {
        return NextResponse.json(
          { error: 'Candidatura não encontrada' },
          { status: 404 }
        );
      }
      return NextResponse.json(application);
    }

    // Busca candidaturas por vaga
    if (jobId) {
      try {
        // Verifica se a vaga existe
        const job = await getJobById(jobId);
        if (!job) {
          return NextResponse.json(
            { error: 'Vaga não encontrada' },
            { status: 404 }
          );
        }

        // Busca as candidaturas para esta vaga
        const [applications] = await pool.query(
          `SELECT a.*, 
            u.name as userName,
            u.avatar as userAvatar
          FROM applications a
          LEFT JOIN users u ON a.worker_id = u.id
          WHERE a.job_id = ?`,
          [jobId]
        );

        return NextResponse.json(applications);
      } catch (error) {
        console.error('Erro ao buscar candidaturas para a vaga:', error);
        return NextResponse.json(
          { error: 'Erro ao buscar candidaturas para a vaga' },
          { status: 500 }
        );
      }
    }

    // Busca candidaturas por trabalhador
    if (userId) {
      const worker = await getUserById(userId);
      if (!worker || worker.role !== 'worker') {
        return NextResponse.json(
          { error: 'Usuário não encontrado ou não é um trabalhador' },
          { status: 404 }
        );
      }

      const applications = await getApplicationsByWorkerId(userId);
      return NextResponse.json(applications);
    }

    // Busca candidaturas por empresa
    if (companyId) {
      const company = await getUserById(companyId);
      if (!company || company.role !== 'company') {
        return NextResponse.json(
          { error: 'Empresa não encontrada' },
          { status: 404 }
        );
      }

      const applications = await getApplicationsByCompanyId(companyId);
      return NextResponse.json(applications);
    }

    return NextResponse.json(
      { error: 'Parâmetro userId, companyId, jobId ou applicationId é obrigatório' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao carregar candidaturas:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar candidaturas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { job_id, worker_id, cover_letter } = data;
    
    console.log('Tentando criar candidatura:', { job_id, worker_id, cover_letter_length: cover_letter?.length || 0 });

    // Validações mais detalhadas
    const missingFields = [];
    if (!job_id) missingFields.push('job_id');
    if (!worker_id) missingFields.push('worker_id');
    // Não exigimos mais cover_letter, mas ainda aceitamos para compatibilidade
    
    if (missingFields.length > 0) {
      const errorMessage = `Campos obrigatórios ausentes: ${missingFields.join(', ')}`;
      console.error(errorMessage, data);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Verifica se trabalhador existe
    const worker = await getUserById(worker_id);
    if (!worker) {
      console.error(`Trabalhador não encontrado: ID ${worker_id}`);
      return NextResponse.json(
        { error: 'Trabalhador não encontrado' },
        { status: 404 }
      );
    }
    
    if (worker.role !== 'worker') {
      console.error(`Usuário não é um trabalhador: ID ${worker_id}, role ${worker.role}`);
      return NextResponse.json(
        { error: 'O usuário precisa ser um trabalhador para se candidatar' },
        { status: 400 }
      );
    }

    // Verifica se vaga existe
    const job = await getJobById(job_id);
    if (!job) {
      console.error(`Vaga não encontrada: ID ${job_id}`);
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se vaga está aberta
    if (job.status !== 'open' && job.status !== 'active' && job.status !== 'published') {
      console.error(`Vaga não está aberta: ID ${job_id}, status ${job.status}`);
      return NextResponse.json(
        { error: `Vaga não está aberta para candidaturas (status atual: ${job.status})` },
        { status: 400 }
      );
    }
    
    // Verifica se o usuário já se candidatou para esta vaga
    try {
      const [existingApplications] = await pool.query(
        'SELECT * FROM applications WHERE job_id = ? AND worker_id = ?', 
        [job_id, worker_id]
      );
      
      if (Array.isArray(existingApplications) && existingApplications.length > 0) {
        console.error(`Usuário já se candidatou para esta vaga: job_id ${job_id}, worker_id ${worker_id}`);
        return NextResponse.json(
          { error: 'Você já se candidatou para esta vaga' },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error('Erro ao verificar candidaturas existentes:', err);
    }

    // Cria candidatura
    console.log('Criando candidatura para vaga:', job_id);
    
    // Verifica se o job_id é uma string válida
    if (typeof job_id !== 'string') {
      console.error(`job_id inválido: ${job_id} (tipo: ${typeof job_id})`);
      return NextResponse.json(
        { error: 'ID da vaga inválido' },
        { status: 400 }
      );
    }
    
    const application = await createApplication({
      job_id,
      worker_id,
      cover_letter: cover_letter || '' // Mantemos para compatibilidade
    });
    
    console.log('Candidatura criada com sucesso:', application);
    return NextResponse.json(application);
  } catch (error) {
    console.error('Erro ao criar candidatura:', error);
    return NextResponse.json(
      { error: 'Erro ao criar candidatura' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    // Permitir todos os status do fluxo
    if (!id || !status || !['pending', 'pending_worker_confirmation', 'accepted', 'rejected', 'accepted_by_company', 'active', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      );
    }

    // Tenta obter o userId do request (se disponível)
    let changedBy = 'system';
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        // Se você tiver JWT, pode decodificar aqui para pegar o userId
        // changedBy = decodeJwt(token).userId;
      }
    } catch {}
    const updated = await updateApplicationStatus(id, status, changedBy);
    if (!updated) {
      return NextResponse.json(
        { error: 'Falha ao atualizar candidatura' },
        { status: 400 }
      );
    }

    // Se status for completed, liberar saldo para o trabalhador
    if (status === 'completed') {
      // Buscar a candidatura e a vaga
      const application = await getApplicationById(id);
      if (application) {
        const job = application.job;
        const workerId = application.worker_id;
        const amount = parseFloat(job.salary_range || '0');
        if (amount > 0) {
          // Atualizar saldo da carteira do trabalhador
          await pool.query(
            'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
            [amount, workerId]
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar candidatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const deleted = await deleteApplication(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Falha ao deletar candidatura' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar candidatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
