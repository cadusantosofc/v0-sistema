import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Mock de usuário - substituir por banco de dados real
let mockUsers = [
  {
    id: "worker-1",
    name: "João Silva",
    email: "joao@example.com",
    role: "worker",
    avatar: "",
    phone: "(11) 98888-8888",
    bio: "Desenvolvedor Full Stack com 5 anos de experiência",
    category: "desenvolvimento"
  },
  {
    id: "company-1",
    name: "Tech Corp",
    email: "tech@example.com",
    role: "company",
    avatar: "",
    phone: "(11) 3333-3333",
    bio: "Empresa de tecnologia focada em inovação",
    website: "https://techcorp.com"
  },
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    avatar: "",
    phone: "(11) 99999-9999"
  }
]

// Função para salvar os usuários no arquivo
async function saveUsers() {
  const usersPath = path.join(process.cwd(), "data", "users.txt")
  await fs.writeFile(usersPath, JSON.stringify(mockUsers, null, 2))
}

// Função para carregar os usuários do arquivo
async function loadUsers() {
  try {
    const usersPath = path.join(process.cwd(), "data", "users.txt")
    const data = await fs.readFile(usersPath, "utf-8")
    mockUsers = JSON.parse(data)
  } catch (error) {
    // Se o arquivo não existir, salva os usuários mock
    await saveUsers()
  }
}

// Carrega os usuários ao inicializar
loadUsers()

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

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { userId, ...updates } = data

    // Encontra e atualiza o usuário
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Atualiza os dados do usuário
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates
    }

    // Salva as alterações
    await saveUsers()

    return NextResponse.json({ user: mockUsers[userIndex] })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
