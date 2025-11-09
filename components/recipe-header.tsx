// components/recipe-header.tsx

"use client"

import { Button } from "@/components/ui/button"
// --- AÑADIR 'BookOpen' ---
import { UtensilsCrossed, NotebookPen, SlidersHorizontal, Search, BookOpen } from "lucide-react"
import Link from "next/link"

export function RecipeHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/recipes" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-serif font-bold">Cocina</span>
        </Link>
        <div className="flex items-center gap-3">
          
          <Button variant="outline" asChild size="sm">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
          
          {/* --- NUEVO BOTÓN "MY COOKBOOKS" (Solo Escritorio) --- */}
          <Button variant="outline" asChild size="sm" className="hidden md:inline-flex">
            <Link href="/cookbooks">
              <BookOpen className="mr-2 h-4 w-4" />
              My Cookbooks
            </Link>
          </Button>
          {/* ----------------------------------------------- */}

          <Button asChild size="sm">
            <Link href="/recipes/new">
              <NotebookPen className="mr-2 h-4 w-4" />
              Add Recipe
            </Link>
          </Button>
          
          <Button variant="outline" asChild size="icon" className="md:hidden">
            <Link href="/settings">
              <SlidersHorizontal className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="hidden md:inline-flex">
            <Link href="/settings">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>

        </div>
      </div>
    </header>
  )
}