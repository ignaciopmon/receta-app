// components/recipe-header.tsx

"use client"

import { Button } from "@/components/ui/button"
import { UtensilsCrossed, NotebookPen, SlidersHorizontal, Search, BookOpen } from "lucide-react"
import Link from "next/link"

export function RecipeHeader() {
  return (
    // Cambiamos 'border-b bg-background' por 'sticky' y efectos de vidrio
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/recipes" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
             <UtensilsCrossed className="h-6 w-6 text-primary transition-transform duration-500 group-hover:rotate-180" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight">Cocina</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          
          <Button variant="ghost" asChild size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild size="sm" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
            <Link href="/cookbooks">
              <BookOpen className="mr-2 h-4 w-4" />
              Cookbooks
            </Link>
          </Button>

          {/* Botón principal con un estilo más sólido */}
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/recipes/new">
              <NotebookPen className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Recipe</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild size="icon" className="md:hidden text-muted-foreground">
            <Link href="/settings">
              <SlidersHorizontal className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" asChild size="icon" className="hidden md:inline-flex text-muted-foreground">
            <Link href="/settings">
              <SlidersHorizontal className="h-5 w-5" />
            </Link>
          </Button>

        </div>
      </div>
    </header>
  )
}