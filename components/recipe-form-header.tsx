// components/recipe-form-header.tsx

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, ArrowLeft, X } from "lucide-react"

export function RecipeFormHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-full -ml-2">
            <Link href="/recipes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <Link href="/recipes" className="flex items-center gap-2 group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
             <UtensilsCrossed className="h-5 w-5 text-primary transition-transform duration-500 group-hover:rotate-180" />
          </div>
          <span className="text-lg font-serif font-bold tracking-tight hidden sm:inline-block">Cocina Editor</span>
        </Link>

        <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
          <Link href="/recipes">
            <X className="h-5 w-5" />
            <span className="sr-only">Cancel</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}