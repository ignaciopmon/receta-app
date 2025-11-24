// components/recipe-header.tsx

"use client"

import { Button } from "@/components/ui/button"
import { 
  UtensilsCrossed, 
  NotebookPen, 
  SlidersHorizontal, 
  Search, 
  BookOpen 
} from "lucide-react"
import Link from "next/link"

export function RecipeHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/recipes" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
             <UtensilsCrossed className="h-6 w-6 text-primary transition-transform duration-500 group-hover:rotate-180" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight">Cocina</span>
        </Link>
        
        {/* Escritorio: Navegación completa */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              <span>Search</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/cookbooks">
              <BookOpen className="mr-2 h-4 w-4" />
              Cookbooks
            </Link>
          </Button>

          <Button asChild size="sm">
            <Link href="/recipes/new">
              <NotebookPen className="mr-2 h-4 w-4" />
              Add Recipe
            </Link>
          </Button>
          
          <Button variant="ghost" asChild size="icon" className="text-muted-foreground">
            <Link href="/settings">
              <SlidersHorizontal className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Móvil: Solo botón "Add" rápido (opcional, ya que está abajo, pero es útil tenerlo arriba también si se hace scroll) 
            o dejarlo limpio. Vamos a dejarlo limpio para que no compita con la barra inferior.
            Si quieres un botón, descomenta esto:
        */}
        {/* <div className="md:hidden">
           <Button asChild size="sm" variant="ghost">
            <Link href="/recipes/new">
              <NotebookPen className="h-5 w-5 text-primary" />
            </Link>
          </Button>
        </div> */}
      </div>
    </header>
  )
}