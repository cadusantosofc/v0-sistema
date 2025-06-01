import { NextResponse } from "next/server"

// Mock de usuário - substituir por banco de dados real
const mockUsers = [
  {
    id: "worker-1",
    name: "João Silva",
    email: "joao@example.com",
    role: "worker",
    avatar: "https://github.com/shadcn.png"
  },
  {
    id: "company-1",
    name: "Tech Corp",
    email: "tech@example.com",
    role: "company",
    avatar: "https://github.com/shadcn.png"
  },
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://github.com/shadcn.png"
  }
]

export async function GET() {
  // Simula usuário autenticado - substituir por lógica real de sessão
  const user = mockUsers[0] // worker por padrão

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    )
  }

  return NextResponse.json({ user })
}
