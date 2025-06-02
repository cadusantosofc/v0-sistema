"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

const formSchema = z.object({
  userType: z.enum(["worker", "company"], {
    required_error: "Selecione o tipo de usuário",
  }),
  userId: z.string().min(1, "Selecione um usuário"),
  type: z.enum(["credit", "debit"], {
    required_error: "Selecione o tipo de operação",
  }),
  amount: z.string().refine(
    (value) => {
      const amount = Number(value.replace(",", "."))
      return !isNaN(amount) && amount > 0
    },
    {
      message: "Valor deve ser maior que zero",
    }
  ),
  description: z.string().min(1, "Descrição é obrigatória"),
})

type FormValues = z.infer<typeof formSchema>

type User = {
  id: string
  name: string
  role: string
  wallet?: {
    id: string
    balance: number
  }
}

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string>()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "worker",
      userId: "",
      type: "credit",
      amount: "",
      description: "",
    },
  })

  // Hook para saldo em tempo real
  const { balance, loading: loadingBalance, reloadBalance } = useWallet(selectedUser || "")

  // Atualiza usuário selecionado quando muda o userId no form
  useEffect(() => {
    const userId = form.watch("userId")
    setSelectedUser(userId)
  }, [form.watch("userId")])

  // Carrega usuários
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users")
        if (!res.ok) throw new Error("Erro ao carregar usuários")
        const data = await res.json()
        setUsers(data)
      } catch (error) {
        console.error("Erro:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar usuários",
        })
      }
    }

    loadUsers()
  }, [toast])

  // Filtra usuários quando o tipo muda
  useEffect(() => {
    const userType = form.watch("userType")
    setFilteredUsers(users.filter(user => user.role === userType))
    form.setValue("userId", "")
  }, [form.watch("userType"), users, form])

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      const amount = Number(data.amount.replace(",", "."))

      if (data.type === "debit" && amount > balance) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Saldo insuficiente",
        })
        return
      }

      const res = await fetch("/api/wallet/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          amount,
        }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || "Erro ao processar operação")
      }

      // Força reload do saldo
      await reloadBalance()

      toast({
        title: "Sucesso",
        description: `Operação realizada com sucesso. Novo saldo: R$ ${responseData.wallet.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      })

      form.reset()
    } catch (error: any) {
      console.error("Erro:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao processar operação",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Gerenciamento Manual de Carteira
          </CardTitle>
          <CardDescription>
            Adicione ou remova saldo manualmente das carteiras dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Usuário</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="worker">Trabalhador</SelectItem>
                        <SelectItem value="company">Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o usuário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                            {selectedUser === user.id && !loadingBalance && (
                              <span className="text-sm text-muted-foreground ml-2">
                                Saldo atual: R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Operação</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="credit">Adicionar Saldo</SelectItem>
                        <SelectItem value="debit">Remover Saldo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0,00"
                        type="text"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          const numbers = value.replace(/[^\d,]/g, "")
                          field.onChange(numbers)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Motivo da operação"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-sm">
                Saldo atual:{" "}
                <span className="font-medium">
                  {loadingBalance
                    ? "Carregando..."
                    : `R$ ${balance.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`}
                </span>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Processando..." : "Confirmar Operação"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
