import { NextResponse } from "next/server"
import { listUsers } from "../../../../src/models/user"

export async function GET() {
  try {
    const users = await listUsers()
    
    // Add default fields and filter out companies
    const formattedUsers = users
      .filter(user => user.role !== 'company')
      .map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
      status: "active",
      createdAt: user.created_at
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
