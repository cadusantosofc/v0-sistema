import { pool } from '../lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { randomUUID } from 'crypto';

// Interface que representa o modelo da tabela no banco de dados
export interface Wallet extends RowDataPacket {
  id: string;
  user_id: string;
  balance: number | string;
  created_at?: Date | string;
  // Campos que não existem na tabela mas são usados no código
  status?: string;
  updated_at?: Date | string;
}

export async function createWallet(userId: string, walletId?: string): Promise<Wallet> {
  // Verifica se já existe carteira para o usuário
  const existingWallet = await getWalletByUserId(userId);
  if (existingWallet) return existingWallet;

  // Cria nova carteira
  const newWalletId = walletId || randomUUID();
  console.log(`Criando nova carteira com ID: ${newWalletId} para usuário: ${userId}`);
  
  await pool.execute<ResultSetHeader>(
    'INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, 0)',
    [newWalletId, userId]
  );

  // Retorna a carteira criada
  const wallet = await getWalletByUserId(userId);
  if (!wallet) throw new Error('Falha ao criar carteira');
  return wallet;
}

export async function getWalletByUserId(userId: string): Promise<Wallet | null> {
  const [wallets] = await pool.execute<(Wallet & RowDataPacket)[]>(
    'SELECT * FROM wallets WHERE user_id = ?',
    [userId]
  );

  return wallets[0] || null;
}

export async function getWalletById(walletId: string): Promise<Wallet | null> {
  const [wallets] = await pool.execute<(Wallet & RowDataPacket)[]>(
    'SELECT * FROM wallets WHERE id = ?',
    [walletId]
  );

  return wallets[0] || null;
}

/**
 * Atualiza o saldo de uma carteira
 * @param idOrWalletId ID do usuário ou da carteira
 * @param newBalance Novo saldo total (não o valor a adicionar/subtrair)
 * @param isWalletId Se true, o primeiro parâmetro é interpretado como ID da carteira. Se false, como ID do usuário.
 * @returns A carteira atualizada ou null em caso de erro
 */
export async function updateWalletBalance(
  idOrWalletId: string, 
  newBalance: number,
  isWalletId: boolean = false
): Promise<Wallet | null> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    let wallet: Wallet | null = null;
    
    // Determinar se estamos usando ID do usuário ou ID da carteira
    if (isWalletId) {
      wallet = await getWalletById(idOrWalletId);
      if (!wallet) {
        throw new Error(`Carteira com ID ${idOrWalletId} não encontrada`);
      }
    } else {
      wallet = await getWalletByUserId(idOrWalletId);
      if (!wallet) {
        throw new Error(`Carteira para usuário ${idOrWalletId} não encontrada`);
      }
    }

    // Garantir que newBalance seja um número
    const numericBalance = parseFloat(newBalance.toString());
    
    if (isNaN(numericBalance)) {
      throw new Error(`Saldo inválido: ${newBalance}`);
    }

    // Formatar saldo com 2 casas decimais
    const formattedBalance = numericBalance.toFixed(2);
    
    console.log(`Atualizando carteira ${wallet.id} para saldo: ${formattedBalance}`);

    // Atualizar saldo
    await connection.execute(
      'UPDATE wallets SET balance = ? WHERE id = ?',
      [formattedBalance, wallet.id]
    );

    await connection.commit();
    
    // Retorna a carteira atualizada
    if (isWalletId) {
      return getWalletById(idOrWalletId);
    } else {
      return getWalletByUserId(idOrWalletId);
    }

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar saldo da carteira:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Adiciona um valor ao saldo existente de uma carteira
 * @param userId ID do usuário
 * @param amount Valor a adicionar (positivo) ou subtrair (negativo)
 * @returns A carteira atualizada ou null em caso de erro
 */
export async function addToWalletBalance(userId: string, amount: number): Promise<Wallet | null> {
  const wallet = await getWalletByUserId(userId);
  
  if (!wallet) {
    throw new Error(`Carteira para usuário ${userId} não encontrada`);
  }
  
  // Converter o saldo atual para número
  const currentBalance = parseFloat(wallet.balance.toString());
  
  // Converter o valor a adicionar para número
  const amountToAdd = parseFloat(amount.toString());
  
  if (isNaN(amountToAdd)) {
    throw new Error(`Valor inválido: ${amount}`);
  }
  
  // Calcular novo saldo
  const newBalance = currentBalance + amountToAdd;
  
  // Verifica se saldo ficaria negativo
  if (newBalance < 0) {
    throw new Error('Saldo insuficiente');
  }
  
  // Atualizar saldo
  return updateWalletBalance(wallet.id, newBalance, true);
}

export async function getWalletBalance(userId: string): Promise<number> {
  const wallet = await getWalletByUserId(userId);
  // Garantir que o saldo retornado seja um número
  return wallet ? parseFloat(wallet.balance.toString()) : 0;
}
