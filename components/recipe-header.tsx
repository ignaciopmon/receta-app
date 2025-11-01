"use client"

import { Button } from "@/components/ui/button"
// --- ICONOS ACTUALIZADOS ---
import { UtensilsCrossed, NotebookPen, SlidersHorizontal } from "lucide-react"
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
          <Button asChild>
            <Link href="/recipes/new">
              {/* --- ICONO CAMBIADO --- */}
              <NotebookPen className="mr-2 h-4 w-4" />
              Add Recipe
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">
              {/* --- ICONO CAMBIADO --- */}
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}