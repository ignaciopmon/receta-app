"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecipeFiltersProps {
  category: string
  onCategoryChange: (value: string) => void
  difficulty: string
  onDifficultyChange: (value: string) => void
  showFavorites: boolean
  onToggleFavorites: () => void
  rating: string
  onRatingChange: (value: string) => void
}

export function RecipeFilters({
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  showFavorites,
  onToggleFavorites,
  rating,
  onRatingChange,
}: RecipeFiltersProps) {
  
  // Estilo base para los triggers de los selectores
  const triggerClass = "w-full sm:w-[140px] h-9 rounded-full border-border/60 bg-background/50 backdrop-blur-sm text-xs font-medium hover:bg-accent/50 hover:border-border transition-all focus:ring-0"

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 w-full sm:w-auto">
      
      {/* Icono decorativo en móvil, oculto en desktop para limpieza */}
      <div className="flex items-center gap-2 self-start sm:hidden text-muted-foreground mb-1">
        <SlidersHorizontal className="h-3 w-3" />
        <span className="text-xs uppercase tracking-wider font-semibold">Filters</span>
      </div>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className={triggerClass}>
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
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={rating} onValueChange={onRatingChange}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          <SelectItem value="5">5 Stars</SelectItem>
          <SelectItem value="4">4+ Stars</SelectItem>
          <SelectItem value="3">3+ Stars</SelectItem>
          <SelectItem value="2">2+ Stars</SelectItem>
          <SelectItem value="1">1+ Star</SelectItem>
          <SelectItem value="0">Unrated</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        variant={showFavorites ? "secondary" : "outline"} 
        size="sm" 
        onClick={onToggleFavorites} 
        className={cn(
          "w-full sm:w-auto rounded-full h-9 px-4 gap-1.5 border-border/60 bg-background/50 backdrop-blur-sm text-xs font-medium hover:bg-accent/50 hover:border-border transition-all",
          showFavorites && "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-400"
        )}
      >
        <Star className={cn("h-3.5 w-3.5", showFavorites ? "fill-current" : "text-muted-foreground")} />
        <span>Favorites</span>
      </Button>
    </div>
  )
}