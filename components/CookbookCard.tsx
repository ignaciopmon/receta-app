// components/CookbookCard.tsx

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Globe, Lock, BookOpen } from "lucide-react"

interface CookbookCardProps {
  id: string
  name: string
  description: string | null
  recipeCount: number
  isPublic: boolean
  cover_color: string | null
  cover_text: string | null
  cover_url?: string | null
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
  const isDarkBg = parseInt(bgColor.substring(1, 3), 16) * 0.299 + 
                   parseInt(bgColor.substring(3, 5), 16) * 0.587 + 
                   parseInt(bgColor.substring(5, 7), 16) * 0.114 < 186

  const textColorClass = isDarkBg ? "text-white" : "text-gray-900"

  return (
    <Link href={`/cookbooks/${id}`} className="block group cookbook-card w-full max-w-[280px] mx-auto cursor-pointer">
      {/* Lomo del Libro */}
      <div className="cookbook-spine" style={{ backgroundColor: bgColor }}>
        <span className={cn("opacity-90", textColorClass)}>{name}</span>
      </div>
      
      {/* Portada del Libro */}
      <Card className="overflow-hidden cookbook-cover flex flex-col aspect-[3/4] w-full border-0 bg-card">
        
        {/* Parte Superior: Imagen o Color */}
        <div className="relative h-3/5 w-full overflow-hidden">
          {cover_url ? (
            <div className="relative w-full h-full">
               <Image 
                 src={cover_url} 
                 alt={name} 
                 fill 
                 className="object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-center p-6 relative"
              style={{ backgroundColor: bgColor }}
            >
               {/* Textura sutil de ruido para dar realismo */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
               <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
               
              <h3 className={cn(
                  "font-serif font-bold text-2xl leading-tight text-balance drop-shadow-sm",
                  textColorClass
                )}>
                {cover_text || name}
              </h3>
            </div>
          )}
          
          {/* Badges flotantes */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isPublic ? (
              <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md p-1.5 rounded-full shadow-sm text-blue-500">
                <Globe className="h-3 w-3" />
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md p-1.5 rounded-full shadow-sm text-muted-foreground">
                <Lock className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
        
        {/* Parte Inferior: Info */}
        <CardContent className="p-5 flex flex-col justify-between flex-1 bg-card border-t border-border/50 relative">
          {/* Sombra interna superior para dar profundidad */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
          
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-lg leading-snug line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            {description ? (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
            ) : (
              <p className="text-xs text-muted-foreground/50 italic">No description</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80 mt-4 pt-3 border-t border-border/40">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{recipeCount} {recipeCount === 1 ? 'Recipe' : 'Recipes'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}