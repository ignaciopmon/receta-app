// components/CookbookCard.tsx

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Globe, Lock } from "lucide-react"

interface CookbookCardProps {
  id: string
  name: string
  description: string | null
  recipeCount: number
  isPublic: boolean
  // --- CAMPOS DE PORTADA NUEVOS ---
  cover_color: string | null
  cover_text: string | null
}

export function CookbookCard({
  id,
  name,
  description,
  recipeCount,
  isPublic,
  cover_color,
  cover_text,
}: CookbookCardProps) {
  
  const bgColor = cover_color || "#444444"
  // Determina si el color de fondo es oscuro
  const isDarkBg = parseInt(bgColor.substring(1, 3), 16) * 0.299 + 
                   parseInt(bgColor.substring(3, 5), 16) * 0.587 + 
                   parseInt(bgColor.substring(5, 7), 16) * 0.114 < 186

  const textColorClass = isDarkBg ? "text-white" : "text-gray-900"

  return (
    <Link href={`/cookbooks/${id}`} className="block group cookbook-card" style={{ perspective: "1000px" }}>
      {/* Lomo del Libro */}
      <div className="cookbook-spine">
        {name}
      </div>
      
      {/* Portada del Libro */}
      <Card className={cn(
        "overflow-hidden cookbook-cover flex flex-col aspect-[4/5] w-full"
      )}>
        {/* --- PORTADA DE COLOR/TEXTO --- */}
        <CardHeader 
          className="relative h-2/3 p-4 flex items-center justify-center text-center"
          style={{ backgroundColor: bgColor }}
        >
          <h3 
            className={cn(
              "font-serif font-bold text-3xl leading-tight text-balance",
              textColorClass
            )}
          >
            {cover_text || name}
          </h3>
        </CardHeader>
        {/* --- FIN DE PORTADA --- */}
        
        <CardContent className="p-4 flex flex-col justify-between flex-1 bg-card">
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 text-card-foreground">{name}</h3>
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