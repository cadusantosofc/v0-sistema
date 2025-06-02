import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  phone: string
  bio?: string
  category?: string
  website?: string
  location?: string
  status?: "active" | "banned"
  rating?: number
  createdAt?: string
}

// Função para carregar os usuários do arquivo
async function loadUsers(): Promise<User[]> {
  try {
    const usersPath = path.join(process.cwd(), "data", "users.txt")
    const data = await fs.readFile(usersPath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erro ao carregar usuários:", error)
    return []
  }
}

export async function GET() {
  try {
    const users = await loadUsers()
    
    // Filter out companies and add default fields
    const formattedUsers = users
      .filter(user => user.role !== "company") // Remove companies
      .map(user => ({
        ...user,
        status: user.status || "active",
        createdAt: user.createdAt || new Date().toISOString(),
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
