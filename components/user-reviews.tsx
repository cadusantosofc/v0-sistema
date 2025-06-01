"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useReviews } from "@/hooks/use-reviews"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Review {
  id: string
  jobId: string
  reviewerId: string
  targetId: string
  rating: number
  comment: string
  createdAt: string
}

interface UserReviewsProps {
  userId: string
  userType: "company" | "worker"
}

export function UserReviews({ userId, userType }: UserReviewsProps) {
  const { loading, error, getUserReviews } = useReviews()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await getUserReviews(userId)
      if (data) {
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
      }
    }

    fetchReviews()
  }, [userId, getUserReviews])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="h-20 w-full bg-muted rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar avaliações: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações</CardTitle>
        <CardDescription>
          {reviews.length} avaliações • Média {averageRating.toFixed(1)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-6">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-1">Nenhuma avaliação</h3>
            <p className="text-sm text-muted-foreground">
              {userType === "company" 
                ? "Esta empresa ainda não recebeu avaliações"
                : "Este profissional ainda não recebeu avaliações"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm mb-2">{review.comment}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
