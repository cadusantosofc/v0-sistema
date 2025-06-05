import { NextResponse } from 'next/server';
import { pool } from "../../../src/lib/db";
import { Job } from './job-utils';
import { getWalletByUserId } from '../../../src/models/wallet';
import { JOB_POSTING_COST } from '../../../src/models/transaction-service';
import { randomUUID } from 'crypto';

// Função auxiliar para buscar vagas por ID da empresa
export async function getJobsByCompanyId(companyId: string): Promise<Job[]> {
  try {
    const [rows] = await pool.query(`
      SELECT j.*, u.name as company_name, u.avatar as company_logo
      FROM jobs j
      LEFT JOIN users u ON j.company_id = u.id
      WHERE j.company_id = ?
      ORDER BY j.created_at DESC
    `, [companyId]);
    
    return rows as Job[];
  } catch (error) {
    console.error('Erro ao buscar vagas por ID da empresa:', error);
    return [];
  }
}

// Função auxiliar para buscar uma vaga por ID
export async function getJobById(id: string): Promise<Job | null> {
  try {
    const [rows] = await pool.query(`
      SELECT 
        j.*, 
        u.name as company_name, 
        u.avatar as company_logo,
        u.bio as company_bio,
        u.email as company_email,
        u.phone as company_phone,
        u.created_at as company_created_at
      FROM jobs j
      LEFT JOIN users u ON j.company_id = u.id
      WHERE j.id = ?
    `, [id]);
    
    const jobs = rows as Job[];
    return jobs.length > 0 ? jobs[0] : null;
  } catch (error) {
    console.error('Erro ao buscar vaga por ID:', error);
    return null;
  }
}

// Função para criar uma nova vaga
export async function createJob(jobData: any, connection = pool): Promise<string | null> {
  try {
    // Formata a data para o formato MySQL (YYYY-MM-DD HH:MM:SS)
    const formatDateForMySQL = (date: Date) => {
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const formattedData = {
      ...jobData,
      created_at: formatDateForMySQL(jobData.created_at || new Date()),
      updated_at: formatDateForMySQL(new Date())
    };

    // Remove the 'id' field from 'formattedData' before insertion
    const { id, ...dataWithoutId } = formattedData;

    // Insert the job into the database without the 'id'
    const [result]: any = await connection.query('INSERT INTO jobs SET ?', [dataWithoutId]);

    // Retrieve the auto-generated ID
    const insertedId = result.insertId || id;

    // Use the insertedId for further operations
    return insertedId;
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    throw error; // Propaga o erro para ser tratado pelo chamador
  }
}

// Função para excluir uma vaga
export async function deleteJob(id: string): Promise<boolean> {
  try {
    await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Erro ao excluir vaga:', error);
    return false;
  }
}

// Função para listar vagas abertas
async function listOpenJobs(category?: string): Promise<Job[]> {
  try {
    console.log('\n=== INÍCIO DA BUSCA DE VAGAS ===');
    
    // Primeiro, busca todas as vagas do banco
    const [allJobs] = await pool.query('SELECT * FROM jobs') as unknown as [Job[]];
    console.log(`Total de vagas no banco: ${allJobs?.length || 0}`);
    
    if (allJobs?.length > 0) {
      console.log('Todas as vagas no banco:', allJobs.map(job => ({
        id: job.id,
        title: job.title,
        status: job.status,
        company_id: job.company_id,
        created_at: job.created_at
      })));
    }
    
    // Filtra as vagas ativas (case insensitive)
    const activeStatuses = ['open', 'active', 'published'];
    let activeJobs = allJobs.filter(job => 
      job.status && activeStatuses.some(status => 
        job.status.toLowerCase() === status.toLowerCase()
      )
    );
    
    console.log(`Encontradas ${activeJobs.length} vagas ativas`);
    
    // Filtra por categoria se fornecida
    if (category) {
      activeJobs = activeJobs.filter(job => 
        job.category && job.category.toLowerCase() === category.toLowerCase()
      );
      console.log(`Filtradas ${activeJobs.length} vagas na categoria '${category}'`);
    }
    
    // Ordena por data de criação (mais recentes primeiro)
    const sortedJobs = [...activeJobs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log('=== FIM DA BUSCA DE VAGAS ===\n');
    return sortedJobs;
  } catch (error) {
    console.error('Erro ao buscar vagas abertas:');
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Erro desconhecido:', error);
    }
    return [];
  }
}

// Função auxiliar para buscar usuário por ID
async function getUserById(userId: string) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  ) as unknown as [any[]];
  return rows[0] || null;
}

// GET /api/jobs
export async function GET(request: Request) {
  console.log('\n=== INÍCIO DA REQUISIÇÃO GET /api/jobs ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const category = searchParams.get('category');
    const jobId = searchParams.get('jobId');
    const debug = searchParams.get('debug') === 'true';
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('role');

    // Se for uma busca por ID específico
    if (jobId) {
      console.log(`Buscando vaga com ID: ${jobId}`);
      const job = await getJobById(jobId);
      
      if (!job) {
        console.log(`Vaga com ID ${jobId} não encontrada`);
        return NextResponse.json(
          { error: 'Vaga não encontrada' },
          { status: 404 }
        );
      }
      
      console.log(`Vaga encontrada: ${job.title} (ID: ${job.id})`);
      return NextResponse.json(job);
    }

    // Se for uma busca por empresa
    if (companyId) {
      console.log(`Buscando vagas para a empresa: ${companyId}`);
      const company = await getUserById(companyId);
      
      if (!company || company.role !== 'company') {
        console.log(`Empresa com ID ${companyId} não encontrada ou não é uma empresa`);
        return NextResponse.json(
          { error: 'Empresa não encontrada' },
          { status: 404 }
        );
      }

      console.log(`Buscando vagas para a empresa ${company.name} (${companyId})`);
      const jobs = await getJobsByCompanyId(companyId);
      console.log(`Encontradas ${jobs.length} vagas para a empresa ${companyId}`);
      return NextResponse.json(jobs);
    }

    // Busca todas as vagas
    const [allJobs] = await pool.query('SELECT * FROM jobs') as unknown as [Job[]];
    let filteredJobs = allJobs;

    // Filtrar vagas pendentes para visibilidade restrita
    if (userId && userRole) {
      filteredJobs = filteredJobs.filter(async (job) => {
        if (job.status === 'pending') {
          if (job.company_id === userId) return true;
          // Verifica se o usuário é trabalhador com candidatura aceita/ativa
          if (userRole === 'worker') {
            const [apps] = await pool.query('SELECT status FROM applications WHERE job_id = ? AND worker_id = ?', [job.id, userId]);
            if (Array.isArray(apps) && apps.some(app => app.status === 'accepted_by_company' || app.status === 'active')) {
              return true;
            }
          }
          return false;
        }
        return true;
      });
    } else {
      // Se não autenticado, remove vagas pendentes
      filteredJobs = filteredJobs.filter(job => job.status !== 'pending');
    }

    // Filtra por categoria se fornecida
    if (category) {
      filteredJobs = filteredJobs.filter(job => job.category && job.category.toLowerCase() === category.toLowerCase());
    }

    // Ordena por data de criação (mais recentes primeiro)
    const sortedJobs = [...filteredJobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return NextResponse.json(sortedJobs);
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vagas' },
      { status: 500 }
    );
  } finally {
    console.log('=== FIM DA REQUISIÇÃO GET /api/jobs ===\n');
  }
}

// POST /api/jobs
export async function POST(request: Request) {
  console.log('\n=== INÍCIO DA REQUISIÇÃO POST /api/jobs ===');
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await request.json();
    console.log('Dados recebidos na API:', data);
    console.log('Company ID:', data.company_id);
    console.log('Título da vaga:', data.title);

    // Validação dos campos obrigatórios
    const requiredFields = ['title', 'description', 'company_id'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log('Campos obrigatórios faltando:', missingFields);
      await connection.rollback();
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Verifica o saldo da carteira dentro da transação
    const [walletRows] = await connection.query(
      'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE',
      [data.company_id]
    ) as unknown as [any[]];
    
    const wallet = walletRows?.[0];
    if (!wallet) {
      await connection.rollback();
      return NextResponse.json(
        { error: `Carteira não encontrada para o usuário ${data.company_id}` },
        { status: 400 }
      );
    }

    const balance = parseFloat(wallet.balance.toString());
    const paymentAmount = Number(data.payment_amount) || 0;
    const totalCost = 10 + paymentAmount; // Taxa fixa + valor da vaga
    
    console.log(`Verificando saldo: R$${balance.toFixed(2)}, necessário: R$${totalCost.toFixed(2)}`);
    
    if (balance < totalCost) {
      await connection.rollback();
      return NextResponse.json(
        { error: `Saldo insuficiente para publicar uma vaga. Disponível: R$${balance.toFixed(2)}, necessário: R$${totalCost.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Cria um novo ID para a vaga
    const id = randomUUID();
    
    try {
      // Cria a vaga no banco de dados usando a mesma conexão da transação
      await createJob({
        id,
        ...data,
        status: 'open',
        created_at: new Date(),
        salary_range: String(paymentAmount),
        payment_amount: paymentAmount // Garante que o valor seja numérico (compatibilidade, mas não existe no banco)
      }, connection);
      
      // Obtém a carteira do usuário
      const [walletRows] = await connection.query(
        'SELECT id FROM wallets WHERE user_id = ?',
        [data.company_id]
      ) as any[];
      
      if (!Array.isArray(walletRows) || walletRows.length === 0) {
        throw new Error('Carteira do usuário não encontrada');
      }
      
      const userWalletId = walletRows[0].id;
      
      // Obtém a carteira do admin
      const [adminRows] = await connection.query(
        'SELECT id FROM wallets WHERE user_id = ?',
        ['admin-1']
      ) as any[];
      
      if (!Array.isArray(adminRows) || adminRows.length === 0) {
        throw new Error('Carteira do admin não encontrada');
      }
      
      const adminWalletId = adminRows[0].id;

      // Registra a transação
      const transactionId = randomUUID();
      await connection.query(
        `INSERT INTO transactions (id, from_wallet_id, to_wallet_id, amount, type, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          userWalletId,
          adminWalletId,
          totalCost,
          'payment',
          'completed'
        ]
      );

      // Atualiza o saldo da carteira do usuário
      await connection.query(
        'UPDATE wallets SET balance = balance - ? WHERE id = ?',
        [totalCost, userWalletId]
      );
      
      // Atualiza o saldo da carteira do admin
      await connection.query(
        'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        [totalCost, adminWalletId]
      );

      // Cria transação hold para o valor da vaga (apenas o valor da vaga, sem a taxa)
      const holdTransactionId = randomUUID();
      await connection.query(
        `INSERT INTO transactions (id, from_wallet_id, to_wallet_id, amount, type, status, job_id)
         VALUES (?, ?, NULL, ?, ?, ?, ?)`,
        [
          holdTransactionId,
          userWalletId,
          paymentAmount, // só o valor da vaga
          'hold',
          'held',
          id // job_id
        ]
      );
      
      // Commit da transação
      await connection.commit();
      
      console.log(`Vaga criada com sucesso: ${id}`);
      return NextResponse.json({
        id,
        success: true,
        message: 'Vaga criada com sucesso',
        transactionId
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Erro durante a transação:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro interno ao criar vaga',
        success: false
      },
      { status: 500 }
    );
  } finally {
    connection.release();
    console.log('=== FIM DA REQUISIÇÃO POST /api/jobs ===\n');
  }
}

// PUT /api/jobs
export async function PUT(request: Request) {
  console.log('\n=== INÍCIO DA REQUISIÇÃO PUT /api/jobs ===');
  
  try {
    const data = await request.json();
    console.log('Dados recebidos para atualização:', data);

    if (!data.id) {
      console.log('ID da vaga não informado');
      return NextResponse.json(
        { error: 'ID da vaga é obrigatório' },
        { status: 400 }
      );
    }

    // Função para formatar data para MySQL
    const formatDateForMySQL = (date: Date) => {
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    // Buscar status anterior
    let oldStatus = null;
    try {
      const [rows] = await pool.query('SELECT status FROM jobs WHERE id = ?', [data.id]);
      oldStatus = rows && rows[0] ? rows[0].status : null;
    } catch {}

    // Atualiza a data de atualização
    const updateData = {
      ...data,
      updated_at: formatDateForMySQL(new Date())
    };

    console.log(`Atualizando vaga com ID: ${data.id}`);
    await pool.query(
      'UPDATE jobs SET ? WHERE id = ?',
      [updateData, data.id]
    );

    // Registrar histórico se status mudou
    if (oldStatus && oldStatus !== data.status) {
      await pool.query(
        'INSERT INTO job_status_history (job_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
        [data.id, oldStatus, data.status, data.userId || 'system']
      );
    }

    console.log(`Vaga ${data.id} atualizada com sucesso`);
    const updatedJob = await getJobById(data.id.toString());
    
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar vaga' },
      { status: 500 }
    );
  } finally {
    console.log('=== FIM DA REQUISIÇÃO PUT /api/jobs ===\n');
  }
}

// DELETE /api/jobs
export async function DELETE(request: Request) {
  console.log('\n=== INÍCIO DA REQUISIÇÃO DELETE /api/jobs ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da vaga não fornecido' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    // Verifica se a vaga existe e pertence ao usuário
    const job = await getJobById(id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }
    
    if (job.company_id !== userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir esta vaga' },
        { status: 403 }
      );
    }

    // Inicia uma transação para garantir a atomicidade
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Buscar candidaturas da vaga
      const [applications] = await connection.query(
        'SELECT status FROM applications WHERE job_id = ?', [id]
      );
      // Verifica se há candidatura ativa ou concluída
      const hasActive = Array.isArray(applications) && applications.some(app => app.status === 'active' || app.status === 'completed');
      // Valor total da vaga
      const jobValue = parseFloat(job.salary_range || '0');
      let refundAmount = jobValue;
      // Se houver trabalho iniciado/concluído, desconta taxa fixa
      if (hasActive) {
        refundAmount = Math.max(0, jobValue - 10); // Exemplo: taxa de 10
      }
      // Exclui a vaga
      await connection.query('DELETE FROM jobs WHERE id = ?', [id]);
      // Obtém a carteira do usuário
      const [walletRows] = await connection.query(
        'SELECT id FROM wallets WHERE user_id = ?',
        [userId]
      ) as any[];
      if (!Array.isArray(walletRows) || walletRows.length === 0) {
        throw new Error('Carteira do usuário não encontrada');
      }
      const userWalletId = walletRows[0].id;
      // Obtém a carteira do admin
      const [adminRows] = await connection.query(
        'SELECT id FROM wallets WHERE user_id = ?',
        ['admin-1']
      ) as any[];
      if (!Array.isArray(adminRows) || adminRows.length === 0) {
        throw new Error('Carteira do admin não encontrada');
      }
      const adminWalletId = adminRows[0].id;
      // Atualiza o saldo da carteira do usuário (reembolso)
      await connection.query(
        'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        [refundAmount, userWalletId]
      );
      // Atualiza o saldo da carteira do admin (desconta o reembolso)
      await connection.query(
        'UPDATE wallets SET balance = balance - ? WHERE id = ?',
        [refundAmount, adminWalletId]
      );
      // Registra a transação de reembolso
      const transactionId = randomUUID();
      await connection.query(
        `INSERT INTO transactions (id, from_wallet_id, to_wallet_id, amount, type, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          adminWalletId,
          userWalletId,
          refundAmount,
          'refund',
          'completed'
        ]
      );
      // Commit da transação
      await connection.commit();
      
    } catch (transactionError) {
      await connection.rollback();
      console.error('Erro ao processar reembolso:', transactionError);
      // Continuamos mesmo se houver erro no reembolso, pois a vaga já foi excluída
      // Mas retornamos uma mensagem de aviso
      return NextResponse.json({
        success: true,
        warning: 'Vaga excluída, mas houve um erro ao processar o reembolso'
      });
    } finally {
      connection.release();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vaga excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir vaga:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir vaga' },
      { status: 500 }
    );
  } finally {
    console.log('=== FIM DA REQUISIÇÃO DELETE /api/jobs ===\n');
  }
}
