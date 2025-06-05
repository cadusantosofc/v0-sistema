import { RowDataPacket } from 'mysql2';
import { pool } from '../lib/db';

interface Chat extends RowDataPacket {
  id: string;
  job_id: string;
  company_id: string;
  worker_id: string;
  company_name: string;
  worker_name: string;
  job_title: string;
  status: 'active' | 'closed';
  created_at: Date;
  updated_at: Date;
}

interface CreateChatData {
  job_id: string;
  company_id: string;
  worker_id: string;
  company_name: string;
  worker_name: string;
  job_title: string;
  status: 'active' | 'closed';
}

// Criar novo chat
export async function createChat(data: CreateChatData): Promise<Chat> {
  const [result] = await pool.execute(
    `INSERT INTO chats (
      job_id, company_id, worker_id, company_name, worker_name, job_title, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.job_id, data.company_id, data.worker_id, data.company_name, data.worker_name, data.job_title, data.status]
  );

  const insertId = (result as any).insertId;
  const [chat] = await pool.query<Chat[]>(
    'SELECT * FROM chats WHERE id = ?',
    [insertId]
  );

  return chat[0];
}

// Buscar chat por ID
export async function getChatById(id: string): Promise<Chat | null> {
  const [chats] = await pool.query<Chat[]>(
    'SELECT * FROM chats WHERE id = ?',
    [id]
  );

  return chats[0] || null;
}

// Listar chats por usuário
export async function getChatsByUserId(userId: string): Promise<Chat[]> {
  const [chats] = await pool.query<Chat[]>(
    'SELECT * FROM chats WHERE company_id = ? OR worker_id = ? ORDER BY updated_at DESC',
    [userId, userId]
  );

  return chats;
}

// Listar chats por vaga
export async function getChatsByJobId(jobId: string): Promise<Chat[]> {
  const [chats] = await pool.query<Chat[]>(
    'SELECT * FROM chats WHERE job_id = ? ORDER BY updated_at DESC',
    [jobId]
  );

  return chats;
}

// Atualizar status do chat
export async function updateChatStatus(id: string, status: 'active' | 'closed'): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE chats SET status = ? WHERE id = ?',
    [status, id]
  );

  return (result as any).affectedRows > 0;
}

// Atualizar data de última atualização do chat
export async function updateChatTimestamp(id: string): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id]
  );

  return (result as any).affectedRows > 0;
}
