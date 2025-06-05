import { NextResponse } from "next/server"
import { listUsers } from "../../../../src/models/user"

export async function GET() {
  try {
    // Busca apenas usuários com role = company
    const users = await listUsers('company')
    
    // Formata os dados das empresas
    const companies = users.map(company => ({
      id: company.id,
      name: company.name,
      email: company.email,
      role: company.role,
      avatar: company.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`,
      phone: company.phone || '',
      website: company.website || '',
      location: company.location || '',
      status: "active",
      totalJobs: 0, // TODO: Implementar contagem de vagas
      totalHires: 0, // TODO: Implementar contagem de contratações
      rating: 0, // TODO: Implementar sistema de avaliações
      createdAt: company.created_at,
      logo: company.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`
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
