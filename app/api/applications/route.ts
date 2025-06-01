import { NextResponse } from "next/server"

// Mock de candidaturas
let applications = [
  {
    id: "1",
    jobId: "1",
    userId: "1",
    companyId: "1",
    status: "pending",
    coverLetter: "Olá, gostaria de me candidatar...",
    createdAt: "2023-01-01T00:00:00.000Z",
    job: {
      id: "1",
      title: "Desenvolvedor Full Stack",
      company: {
        id: "1",
        name: "Tech Corp",
        avatar: ""
      },
      salary: 8000,
      location: "São Paulo, SP",
      type: "full-time"
    }
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const companyId = searchParams.get("companyId")

    let filtered = [...applications]

    if (userId) {
      filtered = filtered.filter(app => app.userId === userId)
    }

    if (companyId) {
      filtered = filtered.filter(app => app.job.company.id === companyId)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar candidaturas" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newApplication = {
      id: String(applications.length + 1),
      ...body,
      status: "pending",
      createdAt: new Date().toISOString()
    }

    applications.push(newApplication)

    return NextResponse.json(newApplication)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar candidatura" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    const application = applications.find(app => app.id === id)
    if (!application) {
      return NextResponse.json(
        { error: "Candidatura não encontrada" },
        { status: 404 }
      )
    }

    application.status = status

    return NextResponse.json(application)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar candidatura" },
      { status: 500 }
    )
  }
}
