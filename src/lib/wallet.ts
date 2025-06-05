import { pool } from './db'
import { RowDataPacket } from 'mysql2'

interface WalletRow extends RowDataPacket {
  id: number
  user_id: string
  balance: number
  status: 'active' | 'blocked'
  created_at: Date
}

export async function getWallet(userId: string) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    )
    
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0]
    }
    
    return null
  } catch (error) {
    console.error('Erro ao buscar carteira:', error)
    throw error
  }
}

export async function hasBalance(userId: string, amount: number): Promise<boolean> {
  try {
    const wallet = await getWallet(userId)
    if (!wallet) return false
    
    return wallet.balance >= amount
  } catch (error) {
    console.error('Erro ao verificar saldo:', error)
    return false
  }
}

export async function updateBalance(userId: string, amount: number, type: 'credit' | 'debit') {
  try {
    const wallet = await getWallet(userId)
    if (!wallet) throw new Error('Carteira não encontrada')

    const newBalance = type === 'credit' 
      ? wallet.balance + amount 
      : wallet.balance - amount

    if (type === 'debit' && newBalance < 0) {
      throw new Error('Saldo insuficiente')
    }

    await pool.query(
      'UPDATE wallets SET balance = ? WHERE user_id = ?',
      [newBalance, userId]
    )

    return { ...wallet, balance: newBalance }
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error)
    throw error
  }
}

export async function createTransaction(data: {
  from_wallet_id: string
  to_wallet_id: string
  amount: number
  type: 'payment' | 'refund' | 'fee'
  status: 'pending' | 'completed' | 'failed'
}) {
  try {
    const [result] = await pool.query(
      `INSERT INTO transactions 
       (from_wallet_id, to_wallet_id, amount, type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.from_wallet_id,
        data.to_wallet_id,
        data.amount,
        data.type,
        data.status
      ]
    )

    if ('insertId' in result) {
      return { id: result.insertId, ...data }
    }

    throw new Error('Erro ao criar transação')
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    throw error
  }
}
