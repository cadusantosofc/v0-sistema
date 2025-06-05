import { RowDataPacket } from 'mysql2';
import { pool } from '../lib/db';
import { Job } from './job';
import { User } from './types';
import { randomUUID } from 'crypto';

export type ApplicationStatus = 'pending' | 'pending_worker_confirmation' | 'accepted' | 'rejected' | 'accepted_by_company' | 'active' | 'completed';

interface Application extends RowDataPacket {
  id: string;
  job_id: string;
  worker_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  userName?: string;
  userAvatar?: string;
  message?: string;
}

export interface ApplicationWithDetails extends Application {
  job: Job & { status: 'open' | 'closed' | 'draft' | 'in_progress' | 'completed' | 'active' | 'published' };
  worker: User;
}

interface CreateApplicationData {
  job_id: string;
  worker_id: string;
  cover_letter: string;
}

// Criar candidatura
export async function createApplication(data: CreateApplicationData): Promise<Application> {
  try {
    // Gera um UUID para o id
    const applicationId = randomUUID();
    
    // Garantir que job_id e worker_id sejam strings
    const job_id = String(data.job_id);
    const worker_id = String(data.worker_id);

    console.log('Criando aplicação com:', { applicationId, job_id, worker_id });

    const [result] = await pool.execute(
      `INSERT INTO applications (
        id, job_id, worker_id, status
      ) VALUES (?, ?, ?, ?)`,
      [applicationId, job_id, worker_id, 'pending']
    );

    const [application] = await pool.query<Application[]>(
      'SELECT * FROM applications WHERE id = ?',
      [applicationId]
    );

    return application[0];
  } catch (error) {
    console.error('Erro ao criar aplicação:', error);
    throw error;
  }
}

// Buscar candidatura por ID com detalhes
export async function getApplicationById(id: string): Promise<ApplicationWithDetails | null> {
  const [applications] = await pool.query<Array<ApplicationWithDetails & {
    worker_id: string;
    worker_name: string;
    worker_email: string;
    worker_avatar: string;
    company_id: string;
    title: string;
    description: string;
    requirements: string[];
    salary_range: string;
    location: string;
    type: string;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>>(
    `SELECT 
      a.*,
      j.*,
      u.id as worker_id,
      u.name as worker_name,
      u.email as worker_email,
      u.avatar as worker_avatar
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.worker_id = u.id
    WHERE a.id = ?`,
    [id]
  );

  if (!applications[0]) return null;

  const app = applications[0];
  return {
    ...app,
    job: {
      id: app.job_id,
      company_id: app.company_id,
      title: app.title,
      description: app.description,
      requirements: app.requirements,
      salary_range: app.salary_range,
      location: app.location,
      type: app.type as any,
      category: app.category,
      status: app.status as any,
      created_at: app.created_at,
      updated_at: app.updated_at
    },
    worker: {
      id: app.worker_id,
      name: app.worker_name,
      email: app.worker_email,
      avatar: app.worker_avatar,
      role: 'worker',
      password: '', // Campo obrigatório
      created_at: new Date().toISOString() // Campo obrigatório
    } as User
  };
}

// Listar candidaturas por trabalhador
export async function getApplicationsByWorkerId(workerId: string): Promise<ApplicationWithDetails[]> {
  const [applications] = await pool.query<Array<Application & {
    worker_id: string;
    worker_name: string;
    worker_email: string;
    worker_avatar: string;
    company_id: string;
    title: string;
    description: string;
    requirements: string[];
    salary_range: string;
    location: string;
    type: string;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>>(
    `SELECT 
      a.*,
      j.*,
      u.id as worker_id,
      u.name as worker_name,
      u.email as worker_email,
      u.avatar as worker_avatar
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.worker_id = u.id
    WHERE a.worker_id = ?`,
    [workerId]
  );
  
  return applications.map(app => ({
    ...app,
    job: {
      id: app.job_id,
      company_id: app.company_id,
      title: app.title,
      description: app.description,
      requirements: app.requirements,
      salary_range: app.salary_range,
      location: app.location,
      type: app.type as any,
      category: app.category,
      status: app.status as any,
      created_at: app.created_at,
      updated_at: app.updated_at
    },
    worker: {
      id: app.worker_id,
      name: app.worker_name,
      email: app.worker_email,
      avatar: app.worker_avatar,
      role: 'worker',
      password: '', // Campo obrigatório
      created_at: new Date().toISOString() // Campo obrigatório
    } as User
  }));
}

// Listar candidaturas por empresa
export async function getApplicationsByCompanyId(companyId: string): Promise<ApplicationWithDetails[]> {
  const [applications] = await pool.query<Array<Application & {
    worker_id: string;
    worker_name: string;
    worker_email: string;
    worker_avatar: string;
    company_id: string;
    title: string;
    description: string;
    requirements: string[];
    salary_range: string;
    location: string;
    type: string;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>>(
    `SELECT 
      a.*,
      j.*,
      u.id as worker_id,
      u.name as worker_name,
      u.email as worker_email,
      u.avatar as worker_avatar
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.worker_id = u.id
    WHERE j.company_id = ?`,
    [companyId]
  );
  
  return applications.map(app => ({
    ...app,
    job: {
      id: app.job_id,
      company_id: app.company_id,
      title: app.title,
      description: app.description,
      requirements: app.requirements,
      salary_range: app.salary_range,
      location: app.location,
      type: app.type as any,
      category: app.category,
      status: app.status as any,
      created_at: app.created_at,
      updated_at: app.updated_at
    },
    worker: {
      id: app.worker_id,
      name: app.worker_name,
      email: app.worker_email,
      avatar: app.worker_avatar,
      role: 'worker',
      password: '', // Campo obrigatório
      created_at: new Date().toISOString() // Campo obrigatório
    } as User
  }));
}

// Buscar candidaturas por vaga
export async function getApplicationsByJobId(jobId: string): Promise<Array<Application & { userName: string; userAvatar: string }>> {
  const [applications] = await pool.query<Array<Application & { userName: string; userAvatar: string }>>(
    `SELECT a.*, 
       u.name as userName,
       u.avatar as userAvatar
     FROM applications a
     LEFT JOIN users u ON a.worker_id = u.id
     WHERE a.job_id = ?`,
    [jobId]
  );
  return applications;
}

// Atualizar status da candidatura
export async function updateApplicationStatus(
  id: string, 
  status: ApplicationStatus,
  changedBy?: string
): Promise<boolean> {
  // Buscar status anterior
  const [rows] = await pool.query('SELECT status FROM applications WHERE id = ?', [id]);
  const oldStatus = rows && rows[0] ? rows[0].status : null;

  const [result] = await pool.execute(
    'UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, id]
  );

  // Registrar histórico se status mudou
  if (oldStatus && oldStatus !== status) {
    await pool.execute(
      'INSERT INTO application_status_history (application_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [id, oldStatus, status, changedBy || 'system']
    );
  }

  return (result as any).affectedRows > 0;
}

// Deletar candidatura
export async function deleteApplication(id: string): Promise<boolean> {
  const [result] = await pool.execute(
    'DELETE FROM applications WHERE id = ?',
    [id]
  );
  return (result as any).affectedRows > 0;
}
