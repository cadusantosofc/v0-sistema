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
  website?: string
  location?: string
  status?: "active" | "banned"
  totalJobs?: number
  totalHires?: number
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
    
    // Filtra apenas empresas e adiciona campos padrão
    const companies = users
      .filter(user => user.role === "company")
      .map(company => ({
        ...company,
        status: company.status || "active",
        totalJobs: company.totalJobs || 0,
        totalHires: company.totalHires || 0,
        rating: company.rating || 0,
        createdAt: company.createdAt || new Date().toISOString(),
        logo: company.avatar // Usa o avatar como logo
      }))

    return NextResponse.json(companies)
  } catch (error) {
    console.error("Erro ao buscar empresas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
