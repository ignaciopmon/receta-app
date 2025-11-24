"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Archive, PenSquare, Star, Utensils, ListOrdered } from "lucide-react"
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
    e.preventDefault()
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
        
        {/* Header de Imagen */}
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
               <span className="font-serif text-4xl italic">Cocina</span>
            </div>
          )}
          
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
          {/* Título y Rating */}
          <div className="mb-4">
            <h3 className="font-serif text-xl font-bold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
              {name}
            </h3>
            <div className="flex items-center justify-between flex-wrap gap-2">
               <StarRating rating={rating} />
               <div className="flex gap-2">
                  {category && (
                    <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0 bg-secondary/50 text-secondary-foreground/80 uppercase tracking-wide">
                      {category}
                    </Badge>
                  )}
                  {/* Dificultad también aquí para consistencia */}
                  {difficulty && (
                    <Badge variant="outline" className="font-normal text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground uppercase tracking-wide">
                      {difficulty}
                    </Badge>
                  )}
               </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-border/40 bg-secondary/10 -mx-1 px-1 rounded-sm">
             <div className="flex flex-col items-center justify-center gap-0.5 border-r border-border/40">
                <span className="text-lg font-bold text-foreground">{ingredients.length}</span>
                <span className="text-[9px] uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                  <Utensils className="h-3 w-3" /> Ingred.
                </span>
             </div>
             <div className="flex flex-col items-center justify-center gap-0.5">
                <span className="text-lg font-bold text-foreground">{steps.length}</span>
                <span className="text-[9px] uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                  <ListOrdered className="h-3 w-3" /> Steps
                </span>
             </div>
          </div>
          
          <div className="flex-1">
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium mb-1">Preview</p>
            <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed italic">
              {ingredients.slice(0, 3).join(", ")}
              {ingredients.length > 3 && "..."}
            </p>
          </div>
        </div>

        {/* Footer de acciones - Fijo para evitar saltos */}
        <div className="p-4 pt-0 mt-auto h-12 flex items-end justify-between gap-2">
          {/* MEJORA MÓVIL: 
             - Mobile: opacity-100 siempre visible.
             - Desktop (md): opacity-0 y aparece con hover.
          */}
          <div className="flex gap-1 w-full justify-between transition-all duration-300 opacity-100 transform translate-y-0 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0">
            <div className="flex gap-1">
              <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                <Link href={`/recipes/edit/${id}`}>
                  <PenSquare className="h-4 w-4" />
                </Link>
              </Button>
              
              {link && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

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
        </div>
        
      </Card>
    </Link>
  )
}