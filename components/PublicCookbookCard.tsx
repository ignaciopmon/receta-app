// components/PublicCookbookCard.tsx

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Users, BookOpen } from "lucide-react"

interface PublicCookbookCardProps {
  id: string
  name: string
  description: string | null
  recipeCount: number
  username: string
  cover_color: string | null
  cover_text: string | null
  cover_url?: string | null
}

export function PublicCookbookCard({
  id,
  name,
  description,
  recipeCount,
  username,
  cover_color,
  cover_text,
  cover_url,
}: PublicCookbookCardProps) {
  
  const bgColor = cover_color || "#444444"
  const isDarkBg = parseInt(bgColor.substring(1, 3), 16) * 0.299 + 
                   parseInt(bgColor.substring(3, 5), 16) * 0.587 + 
                   parseInt(bgColor.substring(5, 7), 16) * 0.114 < 186

  const textColorClass = isDarkBg ? "text-white" : "text-gray-900"

  return (
    <Link href={`/profile/cookbook/${id}`} className="block group cookbook-card w-full max-w-[280px] mx-auto cursor-pointer">
      <div className="cookbook-spine" style={{ backgroundColor: bgColor }}>
        <span className={cn("opacity-90", textColorClass)}>{name}</span>
      </div>
      
      <Card className="overflow-hidden cookbook-cover flex flex-col aspect-[3/4] w-full border-0 bg-card">
        
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
        </div>
        
        <CardContent className="p-5 flex flex-col justify-between flex-1 bg-card border-t border-border/50 relative">
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
          
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground/80 mt-4 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5">
               <BookOpen className="h-3.5 w-3.5" />
               <span>{recipeCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary/80">
              <Users className="h-3.5 w-3.5" />
              <span className="truncate max-w-[80px]">@{username}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}