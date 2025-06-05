"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, StarHalf } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Review {
  id: string
  companyId: string
  companyName: string
  companyAvatar: string
  rating: number
  comment: string
  createdAt: string
}

export default function ReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Corrigir a URL da API para usar o endpoint correto
        const response = await fetch(`/api/reviews?userId=${user?.id}`)
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json()
        // Processar os dados da resposta corretamente
        setReviews(data.reviews?.map(review => ({
          id: review.id,
          companyId: review.reviewer_id,
          companyName: review.reviewer_name || "Empresa",
          companyAvatar: review.reviewer_avatar || "/placeholder.svg",
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at
        })) || [])
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReviews()
    } else {
      setLoading(false)
    }
  }, [user])

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-primary text-primary" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-primary text-primary" />)
    }

    const remainingStars = 5 - stars.length
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />)
    }

    return stars
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Minhas Avaliações</h1>
        <p className="text-muted-foreground">
          Avaliações que você recebeu das empresas
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-1/4 bg-muted rounded" />
                <div className="h-3 w-1/3 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={review.companyAvatar} alt={review.companyName} />
                      <AvatarFallback>{review.companyName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{review.companyName}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma avaliação ainda</CardTitle>
            <CardDescription>
              Suas avaliações aparecerão aqui quando as empresas avaliarem seu trabalho
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
