// components/recipe-search.tsx

"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface RecipeSearchProps {
  value: string
  onChange: (value: string) => void
}

export function RecipeSearch({ value, onChange }: RecipeSearchProps) {
  return (
    // Quitamos 'md:max-w-md' para que ocupe todo el ancho disponible en el nuevo diseño
    <div className="relative w-full group">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <Input
        type="search"
        placeholder="Search your collection..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-11 h-11 rounded-full border-border/60 bg-background/50 backdrop-blur-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
      />
    </div>
  )
}