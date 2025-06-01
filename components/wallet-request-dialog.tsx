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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { DollarSign, Upload, X, Copy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface WalletRequestDialogProps {
  userId: string
  onSubmit: (data: {
    amount: number
    receipt: File
  }) => Promise<void>
  trigger?: React.ReactNode
}

const ADMIN_PIX_KEY = "18998252136"

export function WalletRequestDialog({
  userId,
  onSubmit,
  trigger
}: WalletRequestDialogProps) {
  const [amount, setAmount] = useState("")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setAmount("")
    setReceipt(null)
  }

  const handleSubmit = async () => {
    try {
      const amountNum = Number(amount)
      if (!amountNum || amountNum <= 0) {
        toast({
          variant: "destructive",
          title: "Valor inválido",
          description: "Digite um valor maior que zero"
        })
        return
      }

      if (!receipt) {
        toast({
          variant: "destructive",
          title: "Comprovante obrigatório",
          description: "Anexe o comprovante do pagamento PIX"
        })
        return
      }

      setLoading(true)
      await onSubmit({
        amount: amountNum,
        receipt
      })

      setOpen(false)
      resetForm()
      toast({
        title: "Solicitação enviada",
        description: "Aguarde a aprovação do administrador"
      })
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error)
      toast({
        variant: "destructive",
        title: "Erro ao enviar solicitação",
        description: "Tente novamente mais tarde"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB"
        })
        return
      }
      setReceipt(file)
    }
  }

  const handleRemoveFile = () => {
    setReceipt(null)
    const input = document.getElementById("receipt") as HTMLInputElement
    if (input) input.value = ""
  }

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(ADMIN_PIX_KEY)
      toast({
        title: "Chave PIX copiada!",
        description: "Cole a chave no seu aplicativo do banco"
      })
    } catch (error) {
      console.error("Erro ao copiar chave PIX:", error)
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Tente copiar manualmente"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            Adicionar Saldo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Adicionar Saldo
          </DialogTitle>
          <DialogDescription>
            Faça o PIX e anexe o comprovante para adicionar saldo
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="grid gap-1">
                  <Label>Chave PIX</Label>
                  <p className="text-sm font-medium">{ADMIN_PIX_KEY}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPixKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="receipt">Comprovante PIX</Label>
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {receipt ? (
                <div className="flex items-center justify-between w-full border rounded-md p-2">
                  <span className="truncate">{receipt.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("receipt")?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar comprovante
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: imagens e PDF. Tamanho máximo: 5MB
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
