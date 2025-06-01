"use client"

import { useEffect } from "react"
import { useWallet } from "@/hooks/useWallet"
import { cn } from "@/lib/utils"

interface BalanceProps {
  userId: string
  className?: string
}

export function Balance({ userId, className }: BalanceProps) {
  const { balance, loading, error, reloadBalance } = useWallet(userId)

  // Recarrega saldo quando o componente montar
  useEffect(() => {
    reloadBalance()
  }, [])

  if (loading) {
    return <span className={cn("text-muted-foreground", className)}>Carregando...</span>
  }

  if (error) {
    return <span className={cn("text-destructive", className)}>Erro ao carregar saldo</span>
  }

  // Formata usando Intl.NumberFormat para garantir consistência
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return (
    <span className={className}>
      {formatter.format(balance)}
    </span>
  )
}
