"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, ArrowLeft } from "lucide-react"

export function RecipeFormHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/recipes" className="flex items-center gap-2 font-serif text-xl font-bold">
          <ChefHat className="h-6 w-6" />
          <span>Cocina</span>
        </Link>

        <Button asChild variant="ghost" size="sm">
          <Link href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>
      </div>
    </header>
  )
}
