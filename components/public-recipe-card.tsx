// components/public-recipe-card.tsx

// Esta es una versión simplificada de tu RecipeCard,
// sin botones de editar/borrar y con enlaces a la ruta pública.

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PublicRecipeCardProps {
  id: string
  name: string
  ingredients: string[]
  steps: string[]
  imageUrl?: string | null
  link?: string | null
  category: string | null
  difficulty: string | null
  isFavorite: boolean // Aún podemos mostrar si es favorita
  rating: number | null
}

// Componente helper para las estrellas
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

export function PublicRecipeCard({
  id,
  name,
  ingredients,
  steps,
  imageUrl,
  link,
  category,
  difficulty,
  isFavorite,
  rating,
}: PublicRecipeCardProps) {

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
      )}
      <CardHeader className="relative">
        <h3 className="text-xl font-serif font-semibold leading-tight text-balance pr-10">{name}</h3>
        {isFavorite && (
          <Star className="absolute top-6 right-6 h-5 w-5 fill-yellow-400 text-yellow-400" />
        )}
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
          {/* Enlace a la nueva página de receta pública */}
          <Link href={`/profile/recipe/${id}`}>View Details</Link>
        </Button>
        {link && (
          <Button asChild variant="outline" size="icon">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}