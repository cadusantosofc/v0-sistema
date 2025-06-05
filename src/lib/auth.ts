import { compare, hash } from 'bcryptjs';
import { User } from '../models/types';
import { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail } from '../models/users';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'admin' | 'worker' | 'company';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'worker' | 'company';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    role: 'admin' | 'worker' | 'company';
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await findUserByEmail(credentials.email)
          if (!user) return null

          const isValid = await verifyPassword(credentials.password, user.password)
          if (!isValid) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error("Erro ao autenticar:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log('Verificando senha:', { password, hashedPassword });
  const result = await compare(password, hashedPassword);
  console.log('Resultado da comparação:', result);
  return result;
}

export function sanitizeUser(user: User & { password?: string }) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
