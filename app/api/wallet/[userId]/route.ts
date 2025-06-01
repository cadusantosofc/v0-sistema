import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Função auxiliar para pegar caminho do arquivo
function getWalletPath(userId: string) {
  return path.join(process.cwd(), 'data', 'wallets', `${userId}.txt`)
}

// GET /api/wallet/[userId]
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const walletPath = getWalletPath(userId)
    
    // Verifica se arquivo existe
    try {
      await fs.access(walletPath)
    } catch {
      return NextResponse.json(
        { error: `Carteira ${userId} não encontrada` },
        { status: 404 }
      )
    }
    
    // Lê arquivo da carteira
    const data = await fs.readFile(walletPath, 'utf-8')
    const wallet = JSON.parse(data)

    return NextResponse.json(wallet)
  } catch (error) {
    console.error(`Erro ao ler carteira ${params.userId}:`, error)
    return NextResponse.json(
      { error: 'Erro ao carregar saldo' },
      { status: 500 }
    )
  }
}

// PATCH /api/wallet/[userId]
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const { amount } = await request.json()
    
    const walletPath = getWalletPath(userId)
    
    // Verifica se arquivo existe
    try {
      await fs.access(walletPath)
    } catch {
      return NextResponse.json(
        { error: `Carteira ${userId} não encontrada` },
        { status: 404 }
      )
    }
    
    // Lê carteira atual
    const data = await fs.readFile(walletPath, 'utf-8')
    const wallet = JSON.parse(data)

    // Atualiza saldo
    const newBalance = wallet.balance + amount
    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Saldo não pode ficar negativo' },
        { status: 400 }
      )
    }

    wallet.balance = newBalance

    // Salva carteira
    await fs.writeFile(walletPath, JSON.stringify(wallet, null, 2))

    return NextResponse.json(wallet)
  } catch (error) {
    console.error(`Erro ao atualizar carteira ${params.userId}:`, error)
    return NextResponse.json(
      { error: 'Erro ao atualizar saldo' },
      { status: 500 }
    )
  }
}
