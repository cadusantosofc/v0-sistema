import { pool } from "../../../src/lib/db";

// Definir tipos exportados
export type Job = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status: 'open' | 'closed' | 'draft' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
};

type Application = {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export const getJobById = async (id: string): Promise<Job | null> => {
  const [rows] = await pool.query(
    'SELECT * FROM jobs WHERE id = ?',
    [id]
  ) as any;
  return (rows as Job[])[0] || null;
};

export const getJobsByCompanyId = async (companyId: string): Promise<Job[]> => {
  const [rows] = await pool.query(
    'SELECT * FROM jobs WHERE company_id = ?',
    [companyId]
  ) as any;
  return rows;
};

export const listOpenJobs = async (category?: string): Promise<Job[]> => {
  let query = 'SELECT * FROM jobs WHERE status = ?';
  const params: any[] = ['open']; // Busca apenas vagas com status 'open'
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  console.log('Executando query:', query, 'com parâmetros:', params);
  const [rows] = await pool.query(query, params);
  console.log(`Encontradas ${rows.length} vagas abertas`);
  return rows;
};

export const createJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> => {
  // Garante que o status seja definido como 'open' por padrão
  const jobDataWithStatus = {
    ...jobData,
    status: 'open' as const, // Define o status como 'open' por padrão
  };

  const [result] = await pool.query(
    'INSERT INTO jobs SET ?',
    [jobDataWithStatus]
  ) as any;
  
  const newJob = await getJobById(result.insertId.toString());
  if (!newJob) throw new Error('Falha ao criar vaga');
  return newJob;
};

export const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job | null> => {
  await pool.query(
    'UPDATE jobs SET ? WHERE id = ?',
    [jobData, id]
  );
  
  return getJobById(id);
};
