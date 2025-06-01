"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Briefcase,
  Building2,
  CreditCard,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Star,
  Menu
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(user ? "/dashboard" : "/")
  }

  const getNavigation = () => {
    if (!user) return []

    if (user.role === "admin") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Usuários", href: "/users", icon: Users },
        { name: "Empresas", href: "/companies", icon: Building2 },
        { name: "Vagas", href: "/jobs", icon: Briefcase },
        { name: "Financeiro", href: "/admin/finance", icon: CreditCard },
        { name: "Solicitações", href: "/admin/wallet-requests", icon: CircleDollarSign },
      ]
    }

    if (user.role === "company") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Minhas Vagas", href: "/jobs", icon: Briefcase },
        { name: "Candidaturas", href: "/applications", icon: FileText },
        { name: "Chat", href: "/chat", icon: MessageSquare },
        { name: "Financeiro", href: "/wallet", icon: CreditCard },
      ]
    }

    // worker
    return [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Vagas", href: "/jobs", icon: Briefcase },
      { name: "Minhas Candidaturas", href: "/applications", icon: FileText },
      { name: "Chat", href: "/chat", icon: MessageSquare },
      { name: "Avaliações", href: "/reviews", icon: Star },
      { name: "Carteira", href: "/wallet", icon: CreditCard },
    ]
  }

  const navigation = getNavigation()
  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1">
            <button onClick={handleLogoClick} className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="font-bold">JobMarket</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {navigation.length > 0 && (
                  <>
                    {/* Menu Desktop */}
                    <nav className="hidden md:flex items-center space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                            isActive(item.href)
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    {/* Menu Mobile */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                        <SheetHeader>
                          <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col space-y-4 mt-4">
                          {navigation.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                                isActive(item.href)
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.name}
                            </Link>
                          ))}
                        </nav>
                      </SheetContent>
                    </Sheet>
                  </>
                )}

                <NotificationsDropdown />
                <ThemeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Meu Perfil</Link>
                    </DropdownMenuItem>
                    {navigation.length > 0 && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Configurações</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button>Cadastrar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
