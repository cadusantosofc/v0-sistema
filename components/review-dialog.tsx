"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface ReviewDialogProps {
  jobId: string
  userId: string
  userType: "company" | "worker"
  onSubmit: (rating: number, comment: string) => Promise<void>
  trigger?: React.ReactNode
}

export function ReviewDialog({
  jobId,
  userId,
  userType,
  onSubmit,
  trigger
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    
    try {
      await onSubmit(rating, comment)
      setOpen(false)
      setRating(0)
      setComment("")
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Avaliar</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avaliar {userType === "company" ? "Profissional" : "Empresa"}</DialogTitle>
          <DialogDescription>
            Como foi sua experiência? Sua avaliação ajuda outros usuários.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredStar || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Deixe um comentário sobre sua experiência..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
          >
            {loading ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
