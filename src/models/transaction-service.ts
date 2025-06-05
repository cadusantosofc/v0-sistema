import { pool } from '../lib/db';
import { randomUUID } from 'crypto';
import { getWalletByUserId, createWallet, updateWalletBalance } from './wallet';

// Constantes para valores de transação
export const JOB_POSTING_COST = 10.00;  // Taxa fixa (comissão) para postar uma vaga
const JOB_DELETION_REFUND = 5.00;  // Reembolso parcial ao excluir uma vaga (50% da taxa)

/**
 * Registra uma transação de reembolso quando uma vaga é excluída
 * @param userId ID do usuário que excluiu a vaga
 * @param jobId ID da vaga excluída
 * @returns O ID da transação criada
 */
export async function registerJobDeletionRefundTransaction(userId: string, jobId: string) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar carteira do usuário
    let wallet = await getWalletByUserId(userId);
    if (!wallet) {
      console.log(`Carteira não encontrada para o usuário ${userId}. Criando nova carteira.`);
      wallet = await createWallet(userId);
    }

    // Criar a transação
    const transactionId = randomUUID();
    await connection.execute(
      `INSERT INTO transactions (id, sender_id, receiver_id, amount, type, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId,
        'admin-1', // sender_id (admin)
        userId, // receiver_id (usuário)
        JOB_DELETION_REFUND,
        'refund',
        'completed',
        `Reembolso parcial pela exclusão da vaga #${jobId}`
      ]
    );

    // Atualizar saldo da carteira do usuário
    const balance = parseFloat(wallet.balance.toString());
    const newBalance = balance + JOB_DELETION_REFUND;
    await updateWalletBalance(wallet.id, newBalance, true);

    // Commit
    await connection.commit();
    return transactionId;
  } catch (error) {
    // Rollback em caso de erro
    await connection.rollback();
    console.error('Erro ao registrar transação de reembolso:', error);
    throw error;
  } finally {
    connection.release();
  }
} 