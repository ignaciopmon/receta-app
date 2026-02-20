// components/mobile-nav.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UtensilsCrossed, Search, BookOpen, Bookmark, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  // Ocultamos la barra en login, creación, edición, etc.
  if (
    pathname === "/" || 
    pathname.startsWith("/auth") || 
    pathname.includes("/new") || 
    pathname.includes("/edit") ||
    pathname.endsWith("/print")
  ) {
    return null
  }

  const navItems = [
    {
      href: "/recipes",
      icon: UtensilsCrossed,
      label: "Home",
      active: pathname === "/recipes" || pathname.startsWith("/recipes/"),
    },
    {
      href: "/cookbooks",
      icon: BookOpen,
      label: "Library",
      active: pathname.startsWith("/cookbooks"),
    },
    {
      href: "/recipes/new",
      icon: Plus,
      label: "Add",
      active: false,
      isAction: true // Este es el botón flotante central
    },
    {
      href: "/saved",
      icon: Bookmark,
      label: "Saved",
      active: pathname.startsWith("/saved"),
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
      active: pathname === "/search",
    }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-background/95 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          
          // RENDERIZADO DEL BOTÓN CENTRAL FLOTANTE
          if (item.isAction) {
            return (
              <div key="action-button" className="relative -top-5 flex-shrink-0">
                <Link 
                  href={item.href}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                  <item.icon className="h-6 w-6" strokeWidth={2.5} />
                </Link>
              </div>
            )
          }

          // RENDERIZADO DE LOS BOTONES NORMALES
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors duration-300",
                item.active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon 
                className={cn("h-5 w-5 transition-transform", item.active && "scale-110")} 
                strokeWidth={item.active ? 2.5 : 1.5} 
              />
              <span className={cn(
                "text-[10px] tracking-wide font-serif", 
                item.active ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}