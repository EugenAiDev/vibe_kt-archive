import { ReactNode } from "react"
import PageShell from "@/components/ui/page-shell"

export default function AppLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>
}
