import { RowDataPacket } from 'mysql2';
import { pool } from '../lib/db.server';

// Garantir que este arquivo seja usado apenas no lado do servidor
if (typeof window !== 'undefined') {
  throw new Error('Este arquivo deve ser usado apenas no lado do servidor');
}

// Tipagem para os dados do banco
interface JobData extends RowDataPacket {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status: 'open' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
}

// Interface para os dados que serão retornados para o frontend
export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status: 'open' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
}

// Função para converter dados do banco para o formato do frontend
function mapJobData(job: JobData): Job {
  return {
    id: job.id,
    company_id: job.company_id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    salary_range: job.salary_range,
    location: job.location,
    type: job.type,
    category: job.category,
    status: job.status,
    created_at: job.created_at,
    updated_at: job.updated_at,
  };
}

interface CreateJobData {
  company_id: string;
  title: string;
  description: string;
  requirements: string;
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status: 'open' | 'closed' | 'draft';
}

// Criar nova vaga
export async function createJob(data: CreateJobData): Promise<Job> {
  const [result] = await pool.execute(
    `INSERT INTO jobs (
      company_id, title, description, requirements, salary_range,
      location, type, category, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.company_id, data.title, data.description, data.requirements,
      data.salary_range, data.location, data.type, data.category, data.status
    ]
  );

  const insertId = (result as any).insertId;
  const [job] = await pool.query<JobData[]>(
    'SELECT * FROM jobs WHERE id = ?',
    [insertId]
  );

  return mapJobData(job[0]);
}

// Buscar vaga por ID
export async function getJobById(id: string): Promise<Job | null> {
  const [jobs] = await pool.query<JobData[]>(
    'SELECT * FROM jobs WHERE id = ?',
    [id]
  );

  return jobs[0] || null;
}

// Listar vagas por empresa
export async function getJobsByCompanyId(companyId: string): Promise<Job[]> {
  const [jobs] = await pool.query<JobData[]>(
    'SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC',
    [companyId]
  );

  return jobs.map(mapJobData);
}

// Listar vagas abertas
export async function listOpenJobs(category?: string): Promise<Job[]> {
  const [jobs] = await pool.query<JobData[]>(
    'SELECT * FROM jobs WHERE status = ? AND (? IS NULL OR category = ?) ORDER BY created_at DESC',
    ['open', category || null, category || null]
  );

  return jobs.map(mapJobData);
}

// Atualizar vaga
export async function updateJob(id: string, data: Partial<CreateJobData>): Promise<boolean> {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) return false;

  const [result] = await pool.execute(
    `UPDATE jobs SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
    [...values, id]
  );

  return (result as any).affectedRows > 0;
}

// Excluir vaga
export async function deleteJob(id: string): Promise<boolean> {
  const [result] = await pool.execute(
    'DELETE FROM jobs WHERE id = ?',
    [id]
  );

  return (result as any).affectedRows > 0;
}
