import type { ReactNode } from "react"
import Navigation from "./Navigation"
import StatusBar from "./StatusBar"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Desktop Window Header */}
      <Navigation />

      {/* Central Scrollable Workspace */}
      <main className="flex-1 overflow-y-auto px-5 py-4 bg-muted/10">
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Desktop Status Bar */}
      <StatusBar />
    </div>
  )
}
