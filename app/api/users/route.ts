import { NextResponse } from "next/server"
import { getWallet } from "@/lib/wallet"

// Mock de usuários - substituir por banco real
const mockUsers = [
  { id: "worker-1", name: "João Silva", role: "worker", avatar: "" },
  { id: "worker-2", name: "Maria Santos", role: "worker", avatar: "" },
  { id: "company-1", name: "Tech Corp", role: "company", avatar: "" },
  { id: "company-2", name: "Inova Ltda", role: "company", avatar: "" }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    // Filtra usuários por role
    const filteredUsers = role 
      ? mockUsers.filter(user => user.role === role)
      : mockUsers

    // Adiciona saldo atual e avatar padrão para cada usuário
    const usersWithWallet = filteredUsers.map(user => ({
      ...user,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
      wallet: {
        balance: getWallet(user.id)
      }
    }))

    return NextResponse.json(usersWithWallet)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
