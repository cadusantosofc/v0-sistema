import { NextResponse } from "next/server"
import { 
  createReview, 
  getReviewById, 
  getReviewsByReviewedId,
  getUserAverageRating
} from "../../../src/models/review"
import { getUserById } from "../../../src/models/user"

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

// Buscar avaliações
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const reviewId = searchParams.get('id')
    
    // Buscar uma avaliação específica
    if (reviewId) {
      const review = await getReviewById(reviewId)
      if (!review) {
        return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
      }
      return NextResponse.json(review)
    }
    
    // Buscar avaliações de um usuário
    if (userId) {
      // Verificar se o usuário existe
      const user = await getUserById(userId)
      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }
      
      // Buscar avaliações do usuário
      const reviews = await getReviewsByReviewedId(userId)
      
      // Enriquecer os dados com informações do avaliador
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await getUserById(review.reviewer_id)
          return {
            ...review,
            reviewer_name: reviewer?.name || 'Usuário',
            reviewer_avatar: reviewer?.avatar || null
          }
        })
      )
      
      return NextResponse.json(enrichedReviews)
    }
    
    return NextResponse.json(
      { error: "ID do usuário ou da avaliação é obrigatório" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Criar nova avaliação
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { job_id, reviewer_id, reviewed_id, rating, comment } = data
    
    // Validações
    if (!job_id || !reviewer_id || !reviewed_id || !rating) {
      return NextResponse.json(
        { error: "Campos job_id, reviewer_id, reviewed_id e rating são obrigatórios" },
        { status: 400 }
      )
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "A avaliação deve ser entre 1 e 5" },
        { status: 400 }
      )
    }
    
    // Verificar se o avaliador e o avaliado existem
    const reviewer = await getUserById(reviewer_id)
    if (!reviewer) {
      return NextResponse.json(
        { error: "Avaliador não encontrado" },
        { status: 404 }
      )
    }
    
    const reviewed = await getUserById(reviewed_id)
    if (!reviewed) {
      return NextResponse.json(
        { error: "Avaliado não encontrado" },
        { status: 404 }
      )
    }
    
    // Criar avaliação
    const review = await createReview({
      job_id,
      reviewer_id,
      reviewed_id,
      rating,
      comment: comment || "",
      status: "active"
    })
    
    // Notificar o usuário avaliado
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: reviewed_id,
          title: "Nova avaliação recebida",
          message: `${reviewer.name} avaliou seu trabalho com ${rating} estrelas.`,
          type: "review",
          related_id: review.id,
          related_type: "review"
        })
      })
    } catch (notificationError) {
      console.error("Erro ao enviar notificação de avaliação:", notificationError)
    }
    
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
