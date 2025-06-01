import { NextResponse } from "next/server"

// Mock de usuários - substituir por banco de dados real
const mockUsers = [
  {
    id: "worker-1",
    name: "João Silva",
    email: "joao@example.com",
    password: "123456", // Em produção, usar hash
    role: "worker",
    avatar: "https://github.com/shadcn.png"
  },
  {
    id: "company-1",
    name: "Tech Corp",
    email: "tech@example.com",
    password: "123456",
    role: "company",
    avatar: "https://github.com/shadcn.png"
  },
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
    avatar: "https://github.com/shadcn.png"
  }
]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Busca usuário - em produção, verificar hash da senha
    const user = mockUsers.find(u => 
      u.email === email && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      )
    }

    // Remove senha do retorno
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
