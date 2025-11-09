"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Archive, PenSquare, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
// --- 1. IMPORTAR useRouter ---
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
  // --- 2. HACER onUpdate OPCIONAL ---
  onUpdate?: () => void
  category: string | null
  difficulty: string | null
  isFavorite: boolean
  rating: number | null
}

// ... (El componente StarRating no cambia) ...
function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-muted-foreground/50" />
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
            "h-4 w-4",
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
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
  onUpdate, // <-- Ahora es opcional
  category,
  difficulty,
  isFavorite,
  rating,
}: RecipeCardProps) {
  // --- 3. OBTENER EL ROUTER ---
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFavoriting, setIsFavoriting] = useState(false)
  const [currentFavorite, setCurrentFavorite] = useState(isFavorite)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("recipes").update({ deleted_at: new Date().toISOString() }).eq("id", id)

      if (error) throw error
      
      // --- 4. LÓGICA DE ACTUALIZACIÓN ---
      if (onUpdate) {
        onUpdate() // Llama a la función si existe (para /recipes)
      } else {
        router.refresh() // Recarga la página si no (para /cookbooks/[id])
      }
      
    } catch (error) {
      console.error("Error deleting recipe:", error)
      alert("Failed to delete recipe")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleFavorite = async () => {
    setIsFavoriting(true)
    const newFavoriteState = !currentFavorite
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ is_favorite: newFavoriteState })
        .eq("id", id)

      if (error) throw error
      
      setCurrentFavorite(newFavoriteState)
      
      // --- 5. LÓGICA DE ACTUALIZACIÓN ---
      if (onUpdate) {
        onUpdate() // Llama a la función si existe
      } else {
        router.refresh() // Recarga la página si no
      }
      
    } catch (error) {
      console.error("Error updating favorite:", error)
    } finally {
      setIsFavoriting(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
      )}
      <CardHeader className="relative">
        <h3 className="text-xl font-serif font-semibold leading-tight text-balance pr-10">{name}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-muted-foreground hover:text-yellow-400"
          onClick={handleToggleFavorite}
          disabled={isFavoriting}
        >
          <Star
            className={cn(
              "h-5 w-5 transition-all",
              currentFavorite && "fill-yellow-400 text-yellow-400"
            )}
          />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {category && <Badge variant="outline">{category}</Badge>}
          {difficulty && <Badge variant="secondary">{difficulty}</Badge>}
          <div className="flex-1" />
          <StarRating rating={rating} />
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Ingredients ({ingredients.length})</p>
          <p className="text-sm line-clamp-2">
            {ingredients.slice(0, 3).join(", ")}
            {ingredients.length > 3 && "..."}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Steps ({steps.length})</p>
          <p className="text-sm line-clamp-2">{steps[0]}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="flex-1 bg-transparent">
          <Link href={`/recipes/${id}`}>View Details</Link>
        </Button>
        <Button asChild variant="outline" size="icon">
          <Link href={`/recipes/edit/${id}`}>
            <PenSquare className="h-4 w-4" />
          </Link>
        </Button>
        {link && (
          <Button asChild variant="outline" size="icon">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
          <Archive className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}