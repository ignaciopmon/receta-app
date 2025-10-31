"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Filter } from "lucide-react"

interface RecipeFiltersProps {
  category: string
  onCategoryChange: (value: string) => void
  difficulty: string
  onDifficultyChange: (value: string) => void
  showFavorites: boolean
  onToggleFavorites: () => void
}

export function RecipeFilters({
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  showFavorites,
  onToggleFavorites,
}: RecipeFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="breakfast">Breakfast</SelectItem>
          <SelectItem value="lunch">Lunch</SelectItem>
          <SelectItem value="dinner">Dinner</SelectItem>
          <SelectItem value="dessert">Dessert</SelectItem>
          <SelectItem value="snack">Snack</SelectItem>
          <SelectItem value="beverage">Beverage</SelectItem>
        </SelectContent>
      </Select>

      <Select value={difficulty} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>

      <Button variant={showFavorites ? "default" : "outline"} size="sm" onClick={onToggleFavorites}>
        <Star className={`mr-2 h-4 w-4 ${showFavorites ? "fill-current" : ""}`} />
        Favorites
      </Button>
    </div>
  )
}
