// components/public-recipe-card.tsx

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star, Utensils, ListOrdered, User } from "lucide-react"
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
  isFavorite: boolean
  rating: number | null
  authorUsername?: string // NUEVO: Autor
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-0.5 opacity-30">
        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3" />)}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => <Star key={i} className={cn("h-3 w-3", i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30")} />)}
    </div>
  )
}

export function PublicRecipeCard({
  id, name, ingredients, steps, imageUrl, link, category, difficulty, isFavorite, rating, authorUsername
}: PublicRecipeCardProps) {
  return (
    <Link href={`/profile/recipe/${id}`} className="block h-full group">
      <Card className="h-full overflow-hidden flex flex-col border border-border/40 bg-card transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-border/80 p-0 gap-0 rounded-xl relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground/20">
               <span className="font-serif text-4xl italic">Cocina</span>
            </div>
          )}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/40 to-transparent opacity-60 pointer-events-none" />
        </div>

        <div className="flex flex-col flex-1 p-5">
          {/* Si tiene autor, lo mostramos arriba */}
          {authorUsername && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-2">
              <User className="h-3 w-3" />
              @{authorUsername}
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-serif text-xl font-bold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">{name}</h3>
            <div className="flex items-center justify-between flex-wrap gap-2">
               <StarRating rating={rating} />
               <div className="flex gap-2">
                  {category && <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0 bg-secondary/50 text-secondary-foreground/80 uppercase tracking-wide">{category}</Badge>}
                  {difficulty && <Badge variant="outline" className="font-normal text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground uppercase tracking-wide">{difficulty}</Badge>}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-border/40 bg-secondary/10 -mx-1 px-1 rounded-sm">
             <div className="flex flex-col items-center justify-center gap-0.5 border-r border-border/40">
                <span className="text-lg font-bold text-foreground">{ingredients.length}</span>
                <span className="text-[9px] uppercase text-muted-foreground tracking-widest flex items-center gap-1"><Utensils className="h-3 w-3" /> Ingred.</span>
             </div>
             <div className="flex flex-col items-center justify-center gap-0.5">
                <span className="text-lg font-bold text-foreground">{steps.length}</span>
                <span className="text-[9px] uppercase text-muted-foreground tracking-widest flex items-center gap-1"><ListOrdered className="h-3 w-3" /> Steps</span>
             </div>
          </div>
          
          <div className="flex-1">
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium mb-1">Contains</p>
            <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed italic">
              {ingredients.slice(0, 3).join(", ")}{ingredients.length > 3 && "..."}
            </p>
          </div>
        </div>

        {link ? (
          <div className="p-4 pt-0 mt-auto h-12 flex items-end justify-end">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 hover:bg-primary/5 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">Source</span><ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-2"></div>
        )}
      </Card>
    </Link>
  )
}