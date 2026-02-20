// components/recipe-header.tsx

"use client"

import { Button } from "@/components/ui/button"
import { 
  UtensilsCrossed, 
  Search, 
  BookOpen,
  Bookmark,
  Plus,
  User,
  Settings,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function RecipeHeader() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* LOGO */}
        <Link href="/recipes" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
             <UtensilsCrossed className="h-6 w-6 text-primary transition-transform duration-500 group-hover:rotate-180" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight">Cocina</span>
        </Link>
        
        {/* --- ESCRITORIO: NAVEGACIÓN LIMPIA --- */}
        <div className="hidden md:flex items-center gap-6">
          
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/search"><Search className="mr-2 h-4 w-4" />Discover</Link>
            </Button>
            <Button variant="ghost" asChild size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/cookbooks"><BookOpen className="mr-2 h-4 w-4" />Library</Link>
            </Button>
            <Button variant="ghost" asChild size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/saved"><Bookmark className="mr-2 h-4 w-4" />Saved</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Botón estándar, sin sombras extrañas y con el redondeo habitual */}
            <Button asChild size="sm">
              <Link href="/recipes/new">
                <Plus className="mr-1.5 h-4 w-4" />
                New Recipe
              </Link>
            </Button>
            
            {/* MENÚ DESPLEGABLE DE USUARIO */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                  <User className="h-4 w-4 text-foreground/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 font-sans">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider font-serif">
                  My Account
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" /> 
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> 
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* --- MÓVIL: SOLO EL MENÚ DE USUARIO --- */}
        <div className="md:hidden flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/30 border border-border/30">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-sans">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  )
}