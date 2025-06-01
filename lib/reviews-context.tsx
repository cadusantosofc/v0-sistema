"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Review {
  id: string
  fromUserId: string
  toUserId: string
  jobId?: string
  rating: number
  comment?: string
  createdAt: string
}

interface ReviewsContextType {
  reviews: Review[]
  addReview: (review: Omit<Review, "id" | "createdAt">) => void
  getUserReviews: (userId: string) => Review[]
  getUserRating: (userId: string) => number
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const savedReviews = localStorage.getItem("reviews")
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews))
    }
  }, [])

  const saveReviews = (updatedReviews: Review[]) => {
    setReviews(updatedReviews)
    localStorage.setItem("reviews", JSON.stringify(updatedReviews))
  }

  const addReview = (review: Omit<Review, "id" | "createdAt">) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const updatedReviews = [...reviews, newReview]
    saveReviews(updatedReviews)

    // Criar notificação manualmente para evitar dependência circular
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: review.toUserId,
      title: "Nova avaliação recebida",
      message: `Você recebeu uma avaliação de ${review.rating} estrelas.`,
      type: "review",
      read: false,
      createdAt: new Date().toISOString(),
      data: { reviewId: newReview.id },
      link: "/profile",
    }

    const updatedNotifications = [newNotification, ...notifications]
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  const getUserReviews = (userId: string) => {
    return reviews.filter((review) => review.toUserId === userId)
  }

  const getUserRating = (userId: string) => {
    const userReviews = getUserReviews(userId)
    if (userReviews.length === 0) return 0

    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0)
    return Math.round((totalRating / userReviews.length) * 10) / 10
  }

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        getUserReviews,
        getUserRating,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider")
  }
  return context
}
