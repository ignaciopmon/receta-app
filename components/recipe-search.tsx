"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface RecipeSearchProps {
  value: string
  onChange: (value: string) => void
}

export function RecipeSearch({ value, onChange }: RecipeSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search recipes by name, ingredients, or tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
