"use client"

import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface BalanceProps {
  userId: string
  showSkeleton?: boolean
  className?: string
}

export function Balance({ userId, showSkeleton = true, className }: BalanceProps) {
  const { balance, loading, lastUpdated } = useWallet(userId)

  if (loading && showSkeleton) {
    return <Skeleton className={cn("h-6 w-32", className)} />
  }

  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return (
    <div className={cn("flex items-center space-x-1 group relative", className)}>
      <span>R$</span>
      <span>
        {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </span>
      {lastUpdated && (
        <div className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Atualizado {lastUpdated}
        </div>
      )}
    </div>
  )
}
