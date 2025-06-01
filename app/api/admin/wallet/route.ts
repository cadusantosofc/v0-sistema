import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Função para ler carteira
async function readWallet(userId: string) {
  const walletPath = path.join(process.cwd(), 'data', 'wallets', `${userId}.txt`)
  const data = await fs.readFile(walletPath, 'utf-8')
  return JSON.parse(data)
}

// Função para salvar carteira
async function saveWallet(userId: string, walletData: any) {
  const walletPath = path.join(process.cwd(), 'data', 'wallets', `${userId}.txt`)
  await fs.writeFile(walletPath, JSON.stringify(walletData, null, 2))
}

// POST /api/admin/wallet
export async function POST(request: Request) {
  try {
    const { userId, amount, type, description } = await request.json()

    // Lê carteira atual
    const wallet = await readWallet(userId)

    // Calcula novo saldo
    const newBalance = type === 'add' 
      ? wallet.balance + amount
      : wallet.balance - amount

    // Não permite saldo negativo
    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Saldo não pode ficar negativo' },
        { status: 400 }
      )
    }

    // Atualiza saldo
    wallet.balance = newBalance
    await saveWallet(userId, wallet)

    // Salva transação
    const transaction = {
      id: Date.now().toString(),
      userId,
      type: type === 'add' ? 'recharge' : 'withdrawal',
      amount: amount,
      status: 'approved',
      createdAt: new Date().toISOString(),
      description
    }

    // Lê transações existentes
    const transactionsPath = path.join(process.cwd(), 'data', 'transactions.txt')
    const transactionsData = await fs.readFile(transactionsPath, 'utf-8')
    const { transactions } = JSON.parse(transactionsData)

    // Adiciona nova transação
    transactions.push(transaction)
    await fs.writeFile(
      transactionsPath,
      JSON.stringify({ transactions }, null, 2)
    )

    return NextResponse.json({
      success: true,
      balance: newBalance,
      transaction
    })
  } catch (error) {
    console.error('Erro ao atualizar carteira:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar carteira' },
      { status: 500 }
    )
  }
}
