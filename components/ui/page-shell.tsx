"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default function PageShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    if (menuOpen) {
      html.style.overflow = "hidden"
      body.style.overflow = "hidden"
    } else {
      html.style.overflow = ""
      body.style.overflow = ""
    }

    return () => {
      html.style.overflow = ""
      body.style.overflow = ""
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-transparent lg:grid lg:grid-cols-[300px_1fr]">
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 z-50 h-[100dvh] w-[88vw] max-w-80 overflow-y-auto overscroll-contain bg-[var(--sidebar)] transition lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </div>
      <div className="flex min-h-screen flex-col">
        <Header onMenuToggle={() => setMenuOpen((v) => !v)} isMenuOpen={menuOpen} />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
