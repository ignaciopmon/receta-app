// components/mobile-nav.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UtensilsCrossed, Search, BookOpen, User, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  // No mostrar en login, home pública, o cuando se está editando/creando
  if (
    pathname === "/" || 
    pathname.startsWith("/auth") || 
    pathname.includes("/new") || 
    pathname.includes("/edit") ||
    pathname.endsWith("/print") // Tampoco en vista de impresión
  ) {
    return null
  }

  const navItems = [
    {
      href: "/recipes",
      icon: UtensilsCrossed,
      label: "Recipes",
      active: pathname === "/recipes" || pathname.startsWith("/recipes/"),
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
      active: pathname === "/search",
    },
    {
      href: "/recipes/new",
      icon: PlusCircle,
      label: "Add",
      active: false, // Botón de acción, no estado
      isAction: true
    },
    {
      href: "/cookbooks",
      icon: BookOpen,
      label: "Cookbooks",
      active: pathname.startsWith("/cookbooks"),
    },
    {
      href: "/settings",
      icon: User,
      label: "Me",
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-lg border-t border-border/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95",
              item.isAction 
                ? "text-primary" 
                : item.active 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.isAction ? (
              <div className="bg-primary/10 p-2 rounded-full mb-1">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
            ) : (
              <>
                <item.icon className={cn("h-5 w-5 transition-all", item.active && "fill-current/10")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}