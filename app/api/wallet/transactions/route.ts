import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface Transaction {
  id: string
  userId: string
  type: 'withdrawal' | 'recharge' | 'job'
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface TransactionsData {
  transactions: Transaction[]
}

const TRANSACTIONS_PATH = path.join(process.cwd(), 'data', 'transactions.txt')

// GET /api/wallet/transactions
export async function GET(request: Request) {
  try {
    // Lê arquivo de transações
    const data = await fs.readFile(TRANSACTIONS_PATH, 'utf-8')
    const { transactions }: TransactionsData = JSON.parse(data)

    // Pega userId da query se existir
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Filtra por usuário se userId fornecido
    const filteredTransactions = userId 
      ? transactions.filter(t => t.userId === userId)
      : transactions

    // Ordena por data, mais recente primeiro
    const sortedTransactions = filteredTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(sortedTransactions)
  } catch (error) {
    console.error('Erro ao ler transações:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar transações' },
      { status: 500 }
    )
  }
}

// POST /api/wallet/transactions
export async function POST(request: Request) {
  try {
    const newTransaction: Omit<Transaction, 'id' | 'createdAt'> = await request.json()

    // Lê transações existentes
    const data = await fs.readFile(TRANSACTIONS_PATH, 'utf-8')
    const { transactions }: TransactionsData = JSON.parse(data)

    // Cria nova transação
    const transaction: Transaction = {
      ...newTransaction,
      id: (transactions.length + 1).toString(),
      createdAt: new Date().toISOString()
    }

    // Adiciona à lista e salva
    transactions.push(transaction)
    await fs.writeFile(
      TRANSACTIONS_PATH,
      JSON.stringify({ transactions }, null, 2)
    )

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    return NextResponse.json(
      { error: 'Erro ao criar transação' },
      { status: 500 }
    )
  }
}
