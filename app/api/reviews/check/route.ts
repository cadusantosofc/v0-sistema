import { NextResponse } from "next/server"

// Mock de dados - substituir por banco de dados real
const reviews = [
  {
    id: "1",
    jobId: "job1",
    reviewerId: "user1",
    targetId: "user2",
    rating: 5,
    comment: "Ótimo trabalho!",
    createdAt: new Date().toISOString()
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")
    const userId = searchParams.get("userId")

    if (!jobId || !userId) {
      return NextResponse.json(
        { error: "jobId e userId são obrigatórios" },
        { status: 400 }
      )
    }

    // Verifica se o usuário já avaliou este trabalho
    const existingReview = reviews.find(
      review => review.jobId === jobId && review.reviewerId === userId
    )

    return NextResponse.json({
      hasReviewed: !!existingReview
    })

  } catch (error) {
    console.error("Erro ao verificar avaliação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
