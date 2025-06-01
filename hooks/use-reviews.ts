"use client"

import { useState } from "react"

interface Review {
  id: string
  jobId: string
  reviewerId: string
  targetId: string
  rating: number
  comment: string
  createdAt: string
}

export function useReviews() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkReview = async (jobId: string, userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/reviews/check?jobId=${jobId}&userId=${userId}`)
      
      if (!response.ok) {
        throw new Error("Erro ao verificar avaliação")
      }
      
      const data = await response.json()
      return data.hasReviewed
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      console.error("Erro ao verificar avaliação:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const createReview = async (
    jobId: string,
    reviewerId: string,
    targetId: string,
    rating: number,
    comment: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          reviewerId,
          targetId,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar avaliação")
      }

      const data = await response.json()
      return data as Review
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      console.error("Erro ao criar avaliação:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getUserReviews = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/reviews?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error("Erro ao carregar avaliações")
      }
      
      const data = await response.json()
      return data as { reviews: Review[], averageRating: number }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      console.error("Erro ao carregar avaliações:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    checkReview,
    createReview,
    getUserReviews,
  }
}
