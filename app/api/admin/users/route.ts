import { NextResponse } from "next/server"

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    avatar: "",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Company User",
    email: "company@example.com",
    avatar: "",
    role: "company",
    status: "active",
    createdAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Worker User",
    email: "worker@example.com",
    avatar: "",
    role: "worker",
    status: "active",
    createdAt: "2024-01-03T00:00:00.000Z",
  },
]

export async function GET() {
  // Aqui você deve buscar os usuários do banco de dados
  return NextResponse.json(mockUsers)
}
