"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useReviews } from "@/lib/reviews-context"

interface JobCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  companyId: string
  workerId: string
}

export function JobCompletionModal({ isOpen, onClose, jobId, companyId, workerId }: JobCompletionModalProps) {
  const { user, getUserById } = useAuth()
  const { addReview } = useReviews()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (!user) return null

  const isCompany = user.role === "company"
  const targetUserId = isCompany ? workerId : companyId
  const targetUser = getUserById(targetUserId)

  const handleSubmit = () => {
    if (rating === 0) return

    addReview({
      fromUserId: user.id,
      toUserId: targetUserId,
      jobId,
      rating,
      comment: comment.trim() || undefined,
    })

    setSubmitted(true)
  }

  const handleClose = () => {
    if (submitted) {
      setRating(0)
      setComment("")
      setSubmitted(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {submitted ? "Avaliação enviada!" : `Avaliar ${targetUser ? targetUser.name : "usuário"}`}
          </DialogTitle>
        </DialogHeader>

        {!submitted ? (
          <>
            <div className="flex flex-col items-center space-y-4 py-4">
              <p className="text-center text-sm text-gray-500">
                {isCompany
                  ? "Como você avalia o trabalho deste profissional?"
                  : "Como você avalia sua experiência com esta empresa?"}
              </p>

              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Deixe um comentário (opcional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={rating === 0}>
                Enviar avaliação
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-center text-sm">Obrigado pela sua avaliação!</p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
