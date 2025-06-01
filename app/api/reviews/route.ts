import { NextResponse } from "next/server"

// Mock de avaliações
let reviews = [
  {
    id: "1",
    fromUserId: "1",
    toUserId: "2",
    jobId: "1",
    rating: 5,
    comment: "Ótima empresa para trabalhar!",
    createdAt: "2023-01-01T00:00:00.000Z",
    fromUser: {
      name: "João Silva",
      avatar: ""
    }
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const userReviews = reviews.filter(r => r.toUserId === userId)
    const averageRating = userReviews.length > 0
      ? userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length
      : 0

    return NextResponse.json({
      reviews: userReviews,
      averageRating,
      totalReviews: userReviews.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar avaliações" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fromUserId, toUserId, jobId, rating, comment } = body

    // Verifica se já existe avaliação para esta vaga
    const existingReview = reviews.find(r => 
      r.fromUserId === fromUserId && 
      r.toUserId === toUserId && 
      r.jobId === jobId
    )

    if (existingReview) {
      return NextResponse.json(
        { error: "Você já avaliou esta vaga" },
        { status: 400 }
      )
    }

    const newReview = {
      id: String(reviews.length + 1),
      fromUserId,
      toUserId,
      jobId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      fromUser: {
        name: "João Silva", // TODO: buscar nome real do usuário
        avatar: ""
      }
    }

    reviews.push(newReview)

    return NextResponse.json(newReview)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar avaliação" },
      { status: 500 }
    )
  }
}
