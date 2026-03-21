"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme/ThemeProvider"

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return (
    <ThemeProvider>
      <SessionProvider>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
