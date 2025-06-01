"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { TransactionsProvider } from "@/lib/transactions-context"
import { ActivityLogProvider } from "@/lib/activity-log-context"
import { TicketsProvider } from "@/lib/tickets-context"
import { JobsProvider } from "@/lib/jobs-context"
import { ChatProvider } from "@/lib/chat-context"
import { NotificationsProvider } from "@/lib/notifications-context"
import { ReviewsProvider } from "@/lib/reviews-context"
import { RealtimeProvider } from "@/lib/realtime-context"
import { ApplicationsProvider } from "@/lib/applications-context"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"

// Estas são as rotas onde não queremos mostrar o header
const noHeaderRoutes = ["/", "/login", "/register"]

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showHeader = !noHeaderRoutes.some((route) => pathname === route)

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark"]}
    >
      <AuthProvider>
        <TransactionsProvider>
          <ActivityLogProvider>
            <TicketsProvider>
              <JobsProvider>
                <ChatProvider>
                  <NotificationsProvider>
                    <ReviewsProvider>
                      <RealtimeProvider>
                        <ApplicationsProvider>
                          <div className="min-h-screen bg-background">
                            {showHeader && <Header />}
                            <main>{children}</main>
                            <Toaster />
                          </div>
                        </ApplicationsProvider>
                      </RealtimeProvider>
                    </ReviewsProvider>
                  </NotificationsProvider>
                </ChatProvider>
              </JobsProvider>
            </TicketsProvider>
          </ActivityLogProvider>
        </TransactionsProvider>
      </AuthProvider>
    </NextThemesProvider>
  )
}
