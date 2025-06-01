import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["worker", "company"]),
  document: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  category: z.string().optional(),
})

export const walletSchema = z.object({
  amount: z.number().min(0.01, "Valor mínimo é R$ 0,01"),
  pixKey: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type WalletFormData = z.infer<typeof walletSchema>
