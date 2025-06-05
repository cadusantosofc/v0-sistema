"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface Review {
  id: string
  job_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string
  status: string
  created_at: string
  reviewer?: {
    name: string
    avatar: string
  }
}

interface UserReviewsProps {
  userId: string
  className?: string
}

export function UserReviews({ userId, className }: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true)
        const response = await fetch(`/api/reviews?userId=${userId}`)
        
        if (!response.ok) {
          throw new Error("Erro ao carregar avaliações")
        }
        
        const data = await response.json()
        
        // Buscar informações dos avaliadores
        const reviewsWithReviewers = await Promise.all(
          data.reviews.map(async (review: Review) => {
            try {
              const userResponse = await fetch(`/api/users/${review.reviewer_id}`)
              if (userResponse.ok) {
                const userData = await userResponse.json()
                return {
                  ...review,
                  reviewer: {
                    name: userData.user.name,
                    avatar: userData.user.avatar
                  }
                }
              }
              return review
            } catch (error) {
              return review
            }
          })
        )
        
        setReviews(reviewsWithReviewers)
        setAverageRating(data.averageRating)
        setError("")
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error)
        setError("Não foi possível carregar as avaliações")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchReviews()
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Avaliações
          </CardTitle>
          <CardDescription>Carregando avaliações...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Avaliações
          </CardTitle>
          <CardDescription>Erro ao carregar avaliações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Avaliações
        </CardTitle>
        <CardDescription>
          {reviews.length} avaliação{reviews.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center flex-col">
              <div className="text-3xl font-bold flex items-center gap-1">
                {averageRating.toFixed(1)}
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-sm text-gray-600">
                Média de {reviews.length} avaliação{reviews.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {review.reviewer?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.reviewer?.name || "Usuário"}</div>
                        <div className="text-sm text-gray-600">{formatDate(review.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <div className="mt-3 text-gray-700">{review.comment}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhuma avaliação disponível
          </div>
        )}
      </CardContent>
    </Card>
  )
}
