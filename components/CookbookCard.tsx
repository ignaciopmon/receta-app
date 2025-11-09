// components/CookbookCard.tsx

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BookOpen, Users, Globe, Lock } from "lucide-react"

interface CookbookCardProps {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  recipeCount: number
  isPublic: boolean
}

export function CookbookCard({
  id,
  name,
  description,
  coverUrl,
  recipeCount,
  isPublic,
}: CookbookCardProps) {
  return (
    <Link href={`/cookbooks/${id}`} className="block group cookbook-card" style={{ perspective: "1000px" }}>
      {/* Lomo del Libro */}
      <div className="cookbook-spine">
        {name}
      </div>
      
      {/* Portada del Libro */}
      <Card className={cn(
        "overflow-hidden cookbook-cover flex flex-col aspect-[4/5] w-full",
        !coverUrl && "bg-muted/40"
      )}>
        <CardHeader className="relative h-2/3 p-0">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/60">
              <BookOpen className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 flex flex-col justify-between flex-1">
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2">{name}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>}
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
            <span>{recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}</span>
            {isPublic ? (
              <div className="flex items-center gap-1 text-blue-500">
                <Globe className="h-3 w-3" />
                <span className="text-xs font-medium">Public</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span className="text-xs font-medium">Private</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}