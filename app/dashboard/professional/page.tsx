"use client"

import { Balance } from "@/components/wallet/balance"
import { Button } from "@/components/ui/button"
import { USERS } from "@/constants/users"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfessionalDashboard() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard do Profissional</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {USERS.WORKER.NAME}
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card de Saldo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Balance userId={USERS.WORKER.ID} />
            <p className="text-xs text-muted-foreground mt-1">
              Disponível para saque
            </p>
          </CardContent>
        </Card>

        {/* Card de Candidaturas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">
              0 aguardando resposta
            </p>
          </CardContent>
        </Card>

        {/* Card de Trabalhos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trabalhos Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">
              Total de trabalhos finalizados
            </p>
          </CardContent>
        </Card>

        {/* Card de Avaliação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avaliação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4.5</p>
            <p className="text-xs text-muted-foreground">
              Baseado em avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/jobs">Ver Vagas Disponíveis</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/wallet">Ver Carteira</Link>
        </Button>
      </div>
    </div>
  )
}
