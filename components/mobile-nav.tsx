// components/mobile-nav.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UtensilsCrossed, Search, BookOpen, User, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

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
      label: "Add", // Etiqueta simple y clásica
      active: false,
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-background/95 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between h-16 px-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors duration-300",
              item.active 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/* Icono fino y elegante */}
            <item.icon 
              className={cn("h-5 w-5", item.isAction && "h-6 w-6")} 
              strokeWidth={1.5} // Trazo más fino para elegancia
            />
            
            {/* Texto en fuente Serif (Playfair) para toque vintage */}
            <span className={cn(
              "text-[10px] tracking-wide font-serif", 
              item.active ? "font-semibold" : "font-medium"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}