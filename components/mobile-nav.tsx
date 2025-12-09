// components/mobile-nav.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UtensilsCrossed, Search, BookOpen, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  // Don't show on login, public home, new/edit pages or print view
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
      icon: Plus,
      label: "Add",
      active: false,
      isAction: true // Highlighted center button
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[50] pb-[env(safe-area-inset-bottom)] bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 active:scale-90",
              item.isAction ? "" : "hover:text-foreground"
            )}
          >
            {item.isAction ? (
              // Central "Add" Button (Floating style)
              <div className="relative -top-3 shadow-lg shadow-primary/25">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground border-4 border-background transition-transform hover:scale-105 active:scale-95">
                  <item.icon className="h-6 w-6" strokeWidth={3} />
                </div>
              </div>
            ) : (
              // Standard Items
              <>
                <div className={cn(
                  "p-1.5 rounded-xl transition-colors duration-300",
                  item.active ? "text-foreground bg-primary/10" : "text-muted-foreground"
                )}>
                  <item.icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300", 
                      item.active && "fill-current scale-105"
                    )} 
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  item.active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}