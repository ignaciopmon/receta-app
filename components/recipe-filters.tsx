// components/recipe-filters.tsx

"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, SlidersHorizontal, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecipeFiltersProps {
  category: string
  onCategoryChange: (value: string) => void
  difficulty: string
  onDifficultyChange: (value: string) => void
  showFavorites: boolean
  onToggleFavorites: () => void
  showComponents: boolean
  onToggleComponents: () => void
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
  showComponents,
  onToggleComponents,
  rating,
  onRatingChange,
}: RecipeFiltersProps) {
  
  const triggerClass = "w-full sm:w-[130px] h-9 rounded-full border-border/40 bg-background/50 text-xs font-medium hover:bg-accent/50 hover:border-border transition-all focus:ring-0 shadow-none"

  return (
    // Cambiado a 'justify-start' para alinear con el buscador
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 w-full justify-start">
      
      <div className="flex items-center gap-2 self-start sm:hidden text-muted-foreground mb-1 w-full">
        <SlidersHorizontal className="h-3 w-3" />
        <span className="text-xs uppercase tracking-wider font-semibold">Refine</span>
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
          <SelectItem value="sauce">Sauces</SelectItem>
          <SelectItem value="glaze">Glazes</SelectItem>
          <SelectItem value="dough">Doughs</SelectItem>
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
          <SelectItem value="all">Any Rating</SelectItem>
          <SelectItem value="5">5 Stars</SelectItem>
          <SelectItem value="4">4+ Stars</SelectItem>
          <SelectItem value="3">3+ Stars</SelectItem>
          <SelectItem value="0">Unrated</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2 w-full sm:w-auto">
        <Button 
          variant={showFavorites ? "secondary" : "outline"} 
          size="sm" 
          onClick={onToggleFavorites} 
          className={cn(
            "flex-1 sm:flex-none rounded-full h-9 px-4 gap-1.5 border-border/40 bg-background/50 text-xs font-medium hover:bg-accent/50 hover:border-border transition-all shadow-none",
            showFavorites && "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-400"
          )}
        >
          <Star className={cn("h-3.5 w-3.5", showFavorites ? "fill-current" : "text-muted-foreground")} />
          <span>Favorites</span>
        </Button>

        <Button 
          variant={showComponents ? "secondary" : "outline"} 
          size="sm" 
          onClick={onToggleComponents} 
          className={cn(
            "flex-1 sm:flex-none rounded-full h-9 px-4 gap-1.5 border-border/40 bg-background/50 text-xs font-medium hover:bg-accent/50 hover:border-border transition-all shadow-none",
            showComponents && "bg-primary/10 border-primary/20 text-primary hover:bg-primary/15"
          )}
        >
          <Layers className={cn("h-3.5 w-3.5", showComponents ? "text-primary" : "text-muted-foreground")} />
          <span>Components</span>
        </Button>
      </div>
    </div>
  )
}