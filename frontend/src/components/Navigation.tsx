import { Link, useLocation } from "react-router"
import { BarChart3, Users, FileText, Settings, Wrench, Folder, CheckCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { useFileStore } from "@/stores/fileStore"

const navigationItems = [
  {
    name: "변동사항",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "거래처 관리",
    href: "/partners",
    icon: Users,
  },
  {
    name: "문서 관리",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "업무 유틸",
    href: "/utils",
    icon: Wrench,
  },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
]

export default function Navigation() {
  const location = useLocation()
  const { folderPath } = useFileStore()

  return (
    <header className="h-11 border-b border-border bg-card select-none shrink-0 px-3">
      <div className="h-full flex items-center justify-between">
        {/* Left: App Identifier & Window Title */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-semibold text-xs">
              DJ
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-foreground">Doc Job</span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">문서·거래처 통합관리</span>
            </div>
          </Link>

          {/* Center/Nav: Desktop Segmented Tabs */}
          <nav className="flex items-center space-x-1 bg-muted/50 p-0.5 rounded-md border border-border/60">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = 
                item.href === "/" 
                  ? location.pathname === "/" 
                  : location.pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-colors select-none",
                    isActive
                      ? "bg-background text-foreground shadow-xs border border-border/80 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Quick desktop indicators */}
        <div className="flex items-center space-x-2.5 text-xs text-muted-foreground">
          {folderPath && (
            <Link
              to="/documents"
              className="hidden lg:flex items-center space-x-1 px-2 py-0.5 rounded bg-muted/40 hover:bg-muted text-[11px] border border-border/50 text-foreground transition-colors"
              title="문서 작업 디렉토리"
            >
              <Folder className="h-3 w-3 text-muted-foreground" />
              <span className="max-w-[200px] truncate">{folderPath}</span>
            </Link>
          )}

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-3 w-3" />
            <span className="font-medium">온라인</span>
          </div>
        </div>
      </div>
    </header>
  )
}
