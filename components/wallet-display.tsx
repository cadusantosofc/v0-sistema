'use client'

import { useWallet } from '@/hooks/use-wallet'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface WalletDisplayProps {
  userId: string
  showSkeleton?: boolean
}

export function WalletDisplay({ userId, showSkeleton = true }: WalletDisplayProps) {
  const { balance, loading } = useWallet(userId)

  if (loading && showSkeleton) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">Saldo disponível</div>
        <div className="text-2xl font-bold">
          R$ {balance.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  )
}
