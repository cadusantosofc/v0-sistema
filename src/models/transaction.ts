import { pool } from '../lib/db';
import { Transaction, Wallet } from './types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { updateWalletBalance, createWallet, getWalletByUserId } from './wallet';
import { randomUUID } from 'crypto';

type TransactionInput = {
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
};

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar/criar carteira do usuário
    let userWallet = await getWalletByUserId(input.userId);
    if (!userWallet) {
      userWallet = await createWallet(input.userId);
    }

    // Verificar/criar carteira do admin
    let adminWallet = await getWalletByUserId('admin-1');
    if (!adminWallet) {
      adminWallet = await createWallet('admin-1', 'admin-wallet');
    }

    // Verificar saldo suficiente para débito
    if (input.type === 'withdrawal') {
      const [wallets] = await connection.execute<(Wallet & RowDataPacket)[]>(
        'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE',
        [input.userId]
      );
      const wallet = wallets[0];
      if (!wallet || wallet.balance < input.amount) {
        throw new Error('Saldo insuficiente');
      }
    }

    // Atualizar saldos
    if (input.type === 'withdrawal') {
      await connection.execute(
        'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
        [input.amount, input.userId]
      );
    } else {
      await connection.execute(
        'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
        [input.amount, input.userId]
      );
    }

    // Criar a transação
    const transactionId = randomUUID();
    await connection.execute<ResultSetHeader>(
      `INSERT INTO transactions (id, from_wallet_id, to_wallet_id, amount, type, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        transactionId,
        // Para débito (withdrawal): from = carteira do usuário, to = carteira do admin
        // Para crédito (deposit): from = carteira do admin, to = carteira do usuário
        input.type === 'withdrawal' ? userWallet.id : adminWallet.id,
        input.type === 'withdrawal' ? adminWallet.id : userWallet.id,
        input.amount,
        input.type === 'withdrawal' ? 'payment' : 'refund',
        'completed'
      ]
    );

    await connection.commit();

    const [newTransaction] = await connection.execute<(Transaction & RowDataPacket)[]>(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    return newTransaction[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const [transactions] = await pool.execute<(Transaction & RowDataPacket)[]>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );

  return transactions[0] || null;
}

export async function listUserTransactions(userId: string): Promise<Transaction[]> {
  // Primeiro, obtemos a carteira do usuário
  const wallet = await getWalletByUserId(userId);
  if (!wallet) {
    return [];
  }

  // Buscamos as transações onde a carteira do usuário está envolvida
  const [transactions] = await pool.execute<(Transaction & RowDataPacket)[]>(
    `SELECT t.*, 
            (SELECT user_id FROM wallets WHERE id = t.from_wallet_id) as sender_id,
            (SELECT user_id FROM wallets WHERE id = t.to_wallet_id) as receiver_id
     FROM transactions t
     WHERE t.from_wallet_id = ? OR t.to_wallet_id = ?
     ORDER BY t.created_at DESC`,
    [wallet.id, wallet.id]
  );

  // Mapeamos para o formato esperado pelo frontend
  return transactions.map(t => {
    // Determina o tipo correto de transação para exibição no frontend
    let displayType = t.type;
    
    // Se for um pagamento e o usuário é o remetente, é uma saída (withdrawal)
    // Se for um reembolso e o usuário é o destinatário, é uma entrada (deposit)
    if (t.type === 'payment' && t.sender_id === userId) {
      displayType = 'payment';
    } else if (t.type === 'refund' && t.receiver_id === userId) {
      displayType = 'refund';
    } else if (t.from_wallet_id === wallet.id && t.to_wallet_id !== wallet.id) {
      displayType = 'withdrawal';
    } else if (t.from_wallet_id !== wallet.id && t.to_wallet_id === wallet.id) {
      displayType = 'deposit';
    }
    
    return {
      id: t.id,
      from_wallet_id: t.from_wallet_id,
      to_wallet_id: t.to_wallet_id,
      sender_id: t.sender_id,
      receiver_id: t.receiver_id,
      amount: Number(t.amount),
      type: displayType as 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund',
      status: t.status as 'pending' | 'completed' | 'failed',
      description: t.description || '',
      created_at: new Date(t.created_at).toISOString()
    } as unknown as Transaction;
  });
}

export async function updateTransactionStatus(
  id: string, 
  status: Transaction['status']
): Promise<Transaction | null> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Buscar a transação atual
    const transaction = await getTransactionById(id);
    if (!transaction) return null;

    // Se estiver atualizando para completed, atualizar os saldos
    if (status === 'completed' && transaction.status !== 'completed') {
      if (transaction.type === 'payment') {
        // Débito: from_wallet_id é o usuário
        await updateWalletBalance(transaction.from_wallet_id, -transaction.amount);
      } else if (transaction.type === 'refund') {
        // Crédito: to_wallet_id é o usuário
        await updateWalletBalance(transaction.to_wallet_id, transaction.amount);
      }
    }

    // Atualizar o status da transação
    await connection.execute(
      'UPDATE transactions SET status = ? WHERE id = ?',
      [status, id]
    );

    await connection.commit();

    return getTransactionById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
