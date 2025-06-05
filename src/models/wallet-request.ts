import { pool } from '../lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { randomUUID } from 'crypto';
import { createTransaction } from './transaction';
import { getWalletByUserId, updateWalletBalance } from './wallet';

export type WalletRequest = {
  id: string;
  user_id: string;
  user_name: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  pix_key?: string;
  receipt_url?: string;
  created_at: Date;
  updated_at: Date;
  processed_at?: Date;
  processed_by?: string;
};

export async function createWalletRequest(
  userId: string,
  userName: string,
  type: WalletRequest['type'],
  amount: number,
  pixKey?: string,
  receiptUrl?: string
): Promise<WalletRequest> {
  const id = randomUUID();
  await pool.execute<ResultSetHeader>(
    `INSERT INTO wallet_requests (id, user_id, user_name, type, amount, pix_key, receipt_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, userName, type, amount, pixKey || null, receiptUrl || null]
  );

  const request = await getWalletRequestById(id);
  if (!request) throw new Error("Erro ao criar solicitação");
  return request;
}

export async function getWalletRequestById(id: string): Promise<WalletRequest | null> {
  const [requests] = await pool.execute<(WalletRequest & RowDataPacket)[]>(
    'SELECT * FROM wallet_requests WHERE id = ?',
    [id]
  );

  return requests[0] || null;
}

export async function listPendingWalletRequests(): Promise<WalletRequest[]> {
  const [requests] = await pool.execute<(WalletRequest & RowDataPacket)[]>(
    'SELECT * FROM wallet_requests WHERE status = "pending" ORDER BY created_at DESC'
  );

  return requests;
}

export async function getUserWalletRequests(userId: string): Promise<WalletRequest[]> {
  const [requests] = await pool.execute<(WalletRequest & RowDataPacket)[]>(
    'SELECT * FROM wallet_requests WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  return requests;
}

export async function approveWalletRequest(id: string, adminId: string): Promise<{ request: WalletRequest | null, wallet: { balance: number } }> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Buscar a solicitação
    const [requests] = await connection.execute<(WalletRequest & RowDataPacket)[]>(
      'SELECT * FROM wallet_requests WHERE id = ? FOR UPDATE',
      [id]
    );
    const request = requests[0];
    if (!request) {
      await connection.rollback();
      return { request: null, wallet: { balance: 0 } };
    }

    // Verificar se a solicitação já foi processada
    if (request.status !== 'pending') {
      await connection.rollback();
      return { request: null, wallet: { balance: 0 } };
    }

    // Atualizar saldo da carteira
    let newBalance = 0;
    if (request.type === 'deposit') {
      // Adicionar saldo para recarga
      await updateWalletBalance(request.user_id, request.amount, 'add');
    } else {
      // Subtrair saldo para saque
      await updateWalletBalance(request.user_id, request.amount, 'subtract');
    }

    // Criar transação
    await createTransaction({
      userId: request.user_id,
      amount: request.type === 'deposit' ? request.amount : -request.amount,
      type: request.type === 'deposit' ? 'deposit' : 'withdrawal',
      description: request.type === 'deposit' ? 'Recarga aprovada' : 'Saque aprovado'
    });

    // Atualizar status da solicitação
    await connection.execute(
      'UPDATE wallet_requests SET status = "approved", processed_at = NOW(), processed_by = ? WHERE id = ?',
      [adminId, id]
    );

    await connection.commit();
    
    // Buscar o saldo atualizado
    const wallet = await getWalletByUserId(request.user_id);
    const updatedRequest = await getWalletRequestById(id);
    
    return { 
      request: updatedRequest, 
      wallet: { 
        balance: wallet?.balance || 0 
      } 
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function rejectWalletRequest(id: string, adminId: string): Promise<WalletRequest | null> {
  await pool.execute(
    'UPDATE wallet_requests SET status = "rejected", processed_at = NOW(), processed_by = ? WHERE id = ?',
    [adminId, id]
  );

  return getWalletRequestById(id);
}
