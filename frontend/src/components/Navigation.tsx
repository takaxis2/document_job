import { Link, useLocation } from "react-router"
import { Button } from "./ui/button"
// import { Input } from "./ui/input"
import { BarChart3, Users, FileText, Settings, Wrench } from "lucide-react"
import { cn } from "../lib/utils"

const navigationItems = [
  {
    name: "변동사항",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "거래처",
    href: "/partners",
    icon: Users,
  },
  {
    name: "문서",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "유틸",
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

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">거래처 관리 시스템</span>
            </Link>

            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href

                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn("flex items-center space-x-2", isActive && "bg-primary text-primary-foreground")}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="검색..." className="w-[250px] pl-8" type="search" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div> */}
        </div>
      </div>
    </header>
  )
}
