"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Archive, PenSquare, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation" 
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RecipeCardProps {
  id: string
  name: string
  ingredients: string[]
  steps: string[]
  imageUrl?: string | null
  link?: string | null
  onUpdate?: () => void
  category: string | null
  difficulty: string | null
  isFavorite: boolean
  rating: number | null
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-0.5 opacity-30 hover:opacity-100 transition-opacity">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3 w-3" />
        ))}
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

export function RecipeCard({
  id,
  name,
  ingredients,
  steps,
  imageUrl,
  link,
  onUpdate,
  category,
  difficulty,
  isFavorite,
  rating,
}: RecipeCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFavoriting, setIsFavoriting] = useState(false)
  const [currentFavorite, setCurrentFavorite] = useState(isFavorite)
  const supabase = createClient()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir navegación si se pulsa dentro de un link
    e.stopPropagation()
    
    if (!confirm("Are you sure you want to delete this recipe?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("recipes").update({ deleted_at: new Date().toISOString() }).eq("id", id)

      if (error) throw error
      
      if (onUpdate) {
        onUpdate()
      } else {
        router.refresh()
      }
      
    } catch (error) {
      console.error("Error deleting recipe:", error)
      alert("Failed to delete recipe")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsFavoriting(true)
    const newFavoriteState = !currentFavorite
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ is_favorite: newFavoriteState })
        .eq("id", id)

      if (error) throw error
      
      setCurrentFavorite(newFavoriteState)
      
      if (onUpdate) {
        onUpdate()
      } else {
        router.refresh()
      }
      
    } catch (error) {
      console.error("Error updating favorite:", error)
    } finally {
      setIsFavoriting(false)
    }
  }

  return (
    <Link href={`/recipes/${id}`} className="block h-full group">
      <Card className="h-full overflow-hidden flex flex-col border border-border/40 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-border/80 p-0 gap-0 rounded-xl">
        
        {/* Header de Imagen - Ratio corregido y overlays */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={name} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground/20">
               {/* Placeholder elegante */}
               <span className="font-serif text-4xl italic">Cocina</span>
            </div>
          )}
          
          {/* Overlay degradado para que el botón de favorito resalte */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/30 to-transparent opacity-60 pointer-events-none" />

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-3 right-3 h-8 w-8 rounded-full backdrop-blur-sm transition-all",
              currentFavorite 
                ? "bg-white/90 dark:bg-black/90 text-yellow-500 hover:text-yellow-600 hover:bg-white" 
                : "bg-black/20 text-white hover:bg-white hover:text-yellow-500"
            )}
            onClick={handleToggleFavorite}
            disabled={isFavoriting}
          >
            <Star className={cn("h-4 w-4", currentFavorite && "fill-current")} />
          </Button>
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-1 p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-xl font-bold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                 <StarRating rating={rating} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {category && (
              <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5 bg-secondary/50 text-secondary-foreground/80">
                {category}
              </Badge>
            )}
            {difficulty && (
              <Badge variant="outline" className="font-normal text-xs px-2 py-0.5 border-border/60 text-muted-foreground">
                {difficulty}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1.5 flex-1">
            <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
              <span>Ingredients</span>
              <span>{ingredients.length} items</span>
            </div>
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {ingredients.slice(0, 3).join(", ")}
              {ingredients.length > 3 && "..."}
            </p>
          </div>
        </div>

        {/* Footer de acciones - Minimalista */}
        <div className="p-4 pt-0 mt-auto flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex gap-1">
             {/* Botón Editar */}
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={(e) => e.stopPropagation()}>
              <Link href={`/recipes/edit/${id}`}>
                <PenSquare className="h-4 w-4" />
              </Link>
            </Button>
            
            {/* Botón Link Externo */}
            {link && (
              <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Botón Borrar */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Espaciador para cuando las acciones están ocultas (para evitar saltos) */}
        <div className="h-4 block group-hover:hidden"></div>
      </Card>
    </Link>
  )
}