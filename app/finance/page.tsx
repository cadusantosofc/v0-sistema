"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  ArrowDownUp,
  ArrowUpDown,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Search,
  TrendingDown,
  TrendingUp,
  User
} from "lucide-react"
import { format, formatDistanceToNow, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Transaction {
  id: string
  type: "credit" | "debit"
  amount: number
  description: string
  companyId?: string
  companyName?: string
  userId?: string
  userName?: string
  status: "completed" | "pending" | "failed"
  createdAt: string
}

interface FinancialMetrics {
  totalRevenue: number
  totalTransactions: number
  averageTransaction: number
  revenueGrowth: number
}

const statusMap = {
  completed: { label: "Concluído", color: "bg-green-500" },
  pending: { label: "Pendente", color: "bg-yellow-500" },
  failed: { label: "Falhou", color: "bg-red-500" },
}

export default function FinancePage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    revenueGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Aqui você deve integrar com sua API
        const [transactionsResponse, metricsResponse] = await Promise.all([
          fetch(`/api/admin/transactions?period=${period}`),
          fetch(`/api/admin/financial-metrics?period=${period}`),
        ])

        const [transactionsData, metricsData] = await Promise.all([
          transactionsResponse.json(),
          metricsResponse.json(),
        ])

        setTransactions(transactionsData)
        setMetrics(metricsData)
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "admin") {
      fetchFinancialData()
    }
  }, [user, period])

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/admin/financial-report?period=${period}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-financeiro-${period}-dias.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar relatório:", error)
    }
  }

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(search.toLowerCase()) ||
    transaction.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    transaction.userName?.toLowerCase().includes(search.toLowerCase())
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">
          Gerencie as transações e métricas financeiras da plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.revenueGrowth >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{metrics.revenueGrowth}% em relação ao período anterior
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {metrics.revenueGrowth}% em relação ao período anterior
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Transações
            </CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Nos últimos {period} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média por Transação
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.averageTransaction)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por transação concluída
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Crescimento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.revenueGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">
              Em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações</CardTitle>
              <CardDescription>
                Lista de todas as transações do período
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transação..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={period}
                onValueChange={setPeriod}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem/Destino</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {transaction.type === "credit" ? (
                          <ArrowUpDown className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        {transaction.type === "credit" ? "Crédito" : "Débito"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {transaction.companyName ? (
                          <>
                            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            {transaction.companyName}
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {transaction.userName}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={transaction.type === "credit" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusMap[transaction.status].color} text-white`}>
                        {statusMap[transaction.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Nenhuma transação encontrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
