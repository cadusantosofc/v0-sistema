import { NextResponse } from "next/server"

const mockUser = {
  id: "1",
  name: "João Silva",
  email: "joao@example.com",
  phone: "+55 11 99999-9999",
  avatar: "",
  role: "worker",
  location: "São Paulo, SP",
  bio: "Desenvolvedor Full Stack com mais de 5 anos de experiência em React, Node.js e TypeScript.",
  skills: ["React", "Node.js", "TypeScript", "Next.js", "PostgreSQL"],
  experience: [
    "Desenvolvedor Senior na Tech Corp - 2020 até o momento",
    "Desenvolvedor Pleno na Dev Solutions - 2018 a 2020",
    "Desenvolvedor Junior na Digital Systems - 2016 a 2018"
  ],
  education: [
    "Bacharelado em Ciência da Computação - USP - 2016",
    "MBA em Engenharia de Software - FGV - 2019"
  ],
  rating: 4.8,
  totalJobs: 25,
  createdAt: "2020-01-01T00:00:00.000Z"
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Aqui você deve buscar o usuário do banco de dados
    return NextResponse.json(mockUser)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar usuário" },
      { status: 500 }
    )
  }
}
