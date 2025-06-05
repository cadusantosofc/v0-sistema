"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface ReviewDialogProps {
  jobId: string
  reviewedId: string
  reviewedName: string
  jobTitle: string
  onSuccess?: () => void
  buttonText?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ReviewDialog({
  jobId,
  reviewedId,
  reviewedName,
  jobTitle,
  onSuccess,
  buttonText = "Avaliar",
  buttonVariant = "default"
}: ReviewDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!user) return
    if (rating === 0) {
      setError("Por favor, selecione uma avaliação")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          reviewer_id: user.id,
          reviewed_id: reviewedId,
          rating,
          comment
        })
      })

      if (response.ok) {
        setOpen(false)
        setRating(0)
        setComment("")
        if (onSuccess) onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao enviar avaliação")
      }
    } catch (err) {
      setError("Erro ao enviar avaliação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avaliar {reviewedName}</DialogTitle>
          <DialogDescription>
            Compartilhe sua experiência trabalhando em "{jobTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm text-gray-600">Sua avaliação</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm font-medium">
              {rating === 1 && "Ruim"}
              {rating === 2 && "Regular"}
              {rating === 3 && "Bom"}
              {rating === 4 && "Muito bom"}
              {rating === 5 && "Excelente"}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comentário (opcional)</label>
            <Textarea
              placeholder="Compartilhe detalhes da sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Enviando..." : "Enviar avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
