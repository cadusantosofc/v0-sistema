import fs from 'fs/promises'
import path from 'path'

interface WalletData {
  id: string
  name: string
  type: 'company' | 'worker'
  balance: number
}

export class WalletManager {
  private static WALLETS_DIR = path.join(process.cwd(), 'data', 'wallets')

  // Pega o arquivo da carteira específica
  private static getWalletPath(userId: string): string {
    return path.join(this.WALLETS_DIR, `${userId}.txt`)
  }

  // Lê o saldo atual
  static async getBalance(userId: string): Promise<number> {
    try {
      const walletPath = this.getWalletPath(userId)
      const data = await fs.readFile(walletPath, 'utf-8')
      const wallet: WalletData = JSON.parse(data)
      return wallet.balance
    } catch (error) {
      console.error(`Erro ao ler saldo do usuário ${userId}:`, error)
      return 0
    }
  }

  // Atualiza o saldo (adiciona ou remove)
  static async updateBalance(userId: string, amount: number): Promise<boolean> {
    const walletPath = this.getWalletPath(userId)

    try {
      // Lê a carteira atual
      const data = await fs.readFile(walletPath, 'utf-8')
      const wallet: WalletData = JSON.parse(data)

      // Calcula novo saldo
      const newBalance = wallet.balance + amount

      // Não permite saldo negativo
      if (newBalance < 0) {
        console.error(`Saldo insuficiente para usuário ${userId}`)
        return false
      }

      // Atualiza o arquivo
      wallet.balance = newBalance
      await fs.writeFile(walletPath, JSON.stringify(wallet, null, 2))
      return true
    } catch (error) {
      console.error(`Erro ao atualizar saldo do usuário ${userId}:`, error)
      return false
    }
  }

  // Admin: Ajusta saldo manualmente
  static async adminSetBalance(userId: string, newBalance: number): Promise<boolean> {
    const walletPath = this.getWalletPath(userId)

    try {
      // Lê a carteira atual
      const data = await fs.readFile(walletPath, 'utf-8')
      const wallet: WalletData = JSON.parse(data)

      // Não permite saldo negativo
      if (newBalance < 0) {
        console.error(`Admin tentou definir saldo negativo para usuário ${userId}`)
        return false
      }

      // Atualiza o arquivo
      wallet.balance = newBalance
      await fs.writeFile(walletPath, JSON.stringify(wallet, null, 2))
      return true
    } catch (error) {
      console.error(`Erro ao definir saldo do usuário ${userId}:`, error)
      return false
    }
  }

  // Verifica se tem saldo suficiente
  static async hasEnoughBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    return balance >= amount
  }

  // Transfere saldo entre carteiras
  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<boolean> {
    // Verifica saldo suficiente
    if (!(await this.hasEnoughBalance(fromUserId, amount))) {
      return false
    }

    // Remove do remetente
    const debitSuccess = await this.updateBalance(fromUserId, -amount)
    if (!debitSuccess) return false

    // Adiciona ao destinatário
    const creditSuccess = await this.updateBalance(toUserId, amount)
    if (!creditSuccess) {
      // Se falhou em creditar, devolve ao remetente
      await this.updateBalance(fromUserId, amount)
      return false
    }

    return true
  }
}
