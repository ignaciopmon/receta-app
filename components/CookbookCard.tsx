// components/CookbookCard.tsx

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Globe, Lock } from "lucide-react"

interface CookbookCardProps {
  id: string
  name: string
  description: string | null
  recipeCount: number
  isPublic: boolean
  cover_color: string | null
  cover_text: string | null
  cover_url?: string | null // Nuevo prop opcional
}

export function CookbookCard({
  id,
  name,
  description,
  recipeCount,
  isPublic,
  cover_color,
  cover_text,
  cover_url,
}: CookbookCardProps) {
  
  const bgColor = cover_color || "#444444"
  // Determina si el color de fondo es oscuro para el texto
  const isDarkBg = parseInt(bgColor.substring(1, 3), 16) * 0.299 + 
                   parseInt(bgColor.substring(3, 5), 16) * 0.587 + 
                   parseInt(bgColor.substring(5, 7), 16) * 0.114 < 186

  const textColorClass = isDarkBg ? "text-white" : "text-gray-900"

  return (
    <Link href={`/cookbooks/${id}`} className="block group cookbook-card w-full max-w-[300px] mx-auto">
      {/* Lomo del Libro con el mismo color/fondo */}
      <div className="cookbook-spine" style={{ backgroundColor: bgColor }}>
        <span>{name}</span>
      </div>
      
      {/* Portada del Libro */}
      <Card className="overflow-hidden cookbook-cover flex flex-col aspect-[3/4] w-full border-0">
        
        {/* Renderizado condicional: Imagen o Color */}
        {cover_url ? (
          <div className="relative h-2/3 w-full bg-muted">
             <Image 
               src={cover_url} 
               alt={name} 
               fill 
               className="object-cover"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             />
             {/* Overlay sutil para mejorar la legibilidad del texto si fuera necesario, 
                 o simplemente para dar textura de libro */}
             <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
          </div>
        ) : (
          <CardHeader 
            className="relative h-2/3 p-6 flex items-center justify-center text-center"
            style={{ backgroundColor: bgColor }}
          >
             {/* Efecto de textura/sombra en el borde del lomo */}
             <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
             
            <h3 
              className={cn(
                "font-serif font-bold text-3xl leading-tight text-balance drop-shadow-md",
                textColorClass
              )}
            >
              {cover_text || name}
            </h3>
          </CardHeader>
        )}
        
        <CardContent className="p-4 flex flex-col justify-between flex-1 bg-card border-t border-border/50">
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 text-card-foreground mb-1">
              {name}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
            <span className="font-medium">{recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}</span>
            {isPublic ? (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                <Globe className="h-3 w-3" />
                <span>Public</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                <Lock className="h-3 w-3" />
                <span>Private</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}