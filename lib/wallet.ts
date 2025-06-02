import fs from "fs"
import path from "path"

// Caminho do arquivo de carteiras
const WALLETS_FILE = path.join(process.cwd(), "data", "wallets", "users.txt")

// Garante que o diretório existe
if (!fs.existsSync(path.dirname(WALLETS_FILE))) {
  fs.mkdirSync(path.dirname(WALLETS_FILE), { recursive: true })
}

// Garante que o arquivo existe
if (!fs.existsSync(WALLETS_FILE)) {
  fs.writeFileSync(WALLETS_FILE, "")
}

// Função para ler todas as carteiras
function readWallets(): Map<string, number> {
  try {
    const content = fs.readFileSync(WALLETS_FILE, "utf-8")
    const wallets = new Map<string, number>()
    
    if (!content) return wallets
    
    content.split("\n").forEach(line => {
      if (!line) return
      const [userId, balance] = line.split("|") 
      wallets.set(userId, Number(balance))
    })
    
    return wallets
  } catch (error) {
    console.error("Erro ao ler carteiras:", error)
    return new Map()
  }
}

// Função para salvar todas as carteiras
function saveWallets(wallets: Map<string, number>): boolean {
  try {
    const content = Array.from(wallets.entries())
      .map(([userId, balance]) => `${userId}|${balance}`)
      .join("\n")
    
    fs.writeFileSync(WALLETS_FILE, content)
    return true
  } catch (error) {
    console.error("Erro ao salvar carteiras:", error)
    return false
  }
}

// Função para ler o saldo atual
export function getWallet(userId: string): number {
  const wallets = readWallets()
  return wallets.get(userId) || 0
}

// Função para atualizar saldo com lock de arquivo
export function updateWallet(userId: string, newBalance: number): boolean {
  const lockFile = WALLETS_FILE + ".lock"
  
  try {
    // Tenta obter lock
    if (fs.existsSync(lockFile)) {
      throw new Error("Sistema ocupado, tente novamente")
    }
    
    // Cria lock
    fs.writeFileSync(lockFile, "")
    
    // Garante que o novo saldo não seja negativo
    newBalance = Math.max(0, newBalance)

    // Lê todas as carteiras
    const wallets = readWallets()
    
    // Atualiza o saldo
    wallets.set(userId, newBalance)

    // Salva todas as carteiras
    return saveWallets(wallets)
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
