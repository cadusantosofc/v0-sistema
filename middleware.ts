import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Rotas que requerem autenticação
  const protectedPaths = [
    "/dashboard",
    "/jobs",
    "/chat",
    "/wallet",
    "/profile",
    "/settings",
  ]
  
  // Rotas de autenticação
  const authPaths = ["/login", "/register"]
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Se estiver em uma rota protegida e não estiver autenticado
  if (isProtectedPath) {
    // Verifica se existe um usuário no localStorage
    const user = request.cookies.get("user")
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Se estiver em uma rota de auth e estiver autenticado
  if (isAuthPath) {
    const user = request.cookies.get("user")
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Clonar a resposta para adicionar headers
  const response = NextResponse.next();

  // Adicionar headers CORS para permitir requisições de diferentes origens
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Retornar a resposta modificada
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/chat/:path*",
    "/wallet/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
}
