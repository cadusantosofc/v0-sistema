import fs from "fs"
import path from "path"

// Função para pegar caminho do arquivo da carteira
function getWalletPath(userId: string) {
  return path.join(process.cwd(), "data", "wallets", `${userId}.txt`)
}

// Garante que o diretório existe
if (!fs.existsSync(path.dirname(getWalletPath("example")))) {
  fs.mkdirSync(path.dirname(getWalletPath("example")), { recursive: true })
}

// Função para ler o saldo atual
export function getWallet(userId: string): number {
  try {
    const walletPath = getWalletPath(userId)
    
    // Se arquivo não existe, retorna 0
    if (!fs.existsSync(walletPath)) {
      return 0
    }
    
    const content = fs.readFileSync(walletPath, "utf-8")
    const wallet = JSON.parse(content)
    
    // Garante que retorna 0 se for negativo
    return wallet.balance < 0 ? 0 : wallet.balance
  } catch (error) {
    console.error("Erro ao ler carteira:", error)
    return 0
  }
}

// Função para atualizar saldo com lock de arquivo
export function updateWallet(userId: string, newBalance: number): boolean {
  const walletPath = getWalletPath(userId)
  const lockFile = walletPath + ".lock"
  
  try {
    // Tenta obter lock
    if (fs.existsSync(lockFile)) {
      throw new Error("Sistema ocupado, tente novamente")
    }
    
    // Cria lock
    fs.writeFileSync(lockFile, "")
    
    // Garante que o novo saldo não seja negativo
    newBalance = Math.max(0, newBalance)

    // Se arquivo não existe, cria com saldo inicial
    if (!fs.existsSync(walletPath)) {
      const initialWallet = {
        id: userId,
        balance: newBalance
      }
      fs.writeFileSync(walletPath, JSON.stringify(initialWallet, null, 2))
      return true
    }

    // Lê carteira atual
    const content = fs.readFileSync(walletPath, "utf-8")
    const wallet = JSON.parse(content)

    // Atualiza o saldo
    wallet.balance = newBalance

    // Salva de volta no arquivo
    fs.writeFileSync(walletPath, JSON.stringify(wallet, null, 2))
    
    return true
  } catch (error) {
    console.error("Erro ao atualizar carteira:", error)
    return false
  } finally {
    // Remove lock
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile)
    }
  }
}

// Função para processar operação com validação estrita
export function processOperation(userId: string, type: "credit" | "debit", amount: number): { success: boolean, balance?: number, error?: string } {
  try {
    // Valida valor
    if (amount <= 0) {
      return {
        success: false,
        error: "Valor deve ser maior que zero"
      }
    }

    // Lê saldo atual
    const currentBalance = getWallet(userId)

    // Valida saldo para débito
    if (type === "debit") {
      if (currentBalance < amount) {
        return { 
          success: false, 
          error: "Saldo insuficiente",
          balance: currentBalance
        }
      }
    }

    // Calcula novo saldo
    const newBalance = type === "credit" 
      ? currentBalance + amount 
      : Math.max(0, currentBalance - amount) // Garante não negativo

    // Tenta atualizar saldo
    if (!updateWallet(userId, newBalance)) {
      return {
        success: false,
        error: "Erro ao atualizar saldo. Tente novamente.",
        balance: currentBalance
      }
    }

    // Lê saldo novamente para confirmar
    const finalBalance = getWallet(userId)
    
    return {
      success: true,
      balance: finalBalance
    }
  } catch (error) {
    console.error("Erro ao processar operação:", error)
    return { 
      success: false, 
      error: "Erro ao processar operação" 
    }
  }
}

// Função para verificar se tem saldo suficiente
export function hasBalance(userId: string, amount: number): boolean {
  const balance = getWallet(userId)
  return balance >= amount
}
