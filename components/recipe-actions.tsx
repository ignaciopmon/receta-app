// components/recipe-actions.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { 
  PenSquare, 
  ExternalLink, 
  Share2, 
  Globe, 
  Loader2, 
  Printer, 
  MoreHorizontal,
  EyeOff,
  Link2
} from "lucide-react"
import { AddRecipeToCookbook } from "@/components/AddRecipeToCookbook"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RecipeActionsProps {
  recipeId: string
  initialIsPublic: boolean
  link: string | null
  isComponent?: boolean
}

export function RecipeActions({ recipeId, initialIsPublic, link, isComponent }: RecipeActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [isLoading, setIsLoading] = useState(false)

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/recipe/${recipeId}` : ''

  const handleShare = async () => {
    setIsLoading(true)
    
    try {
      // 1. Si no es pública, hacerla pública primero
      if (!isPublic) {
        const { error } = await supabase
          .from("recipes")
          .update({ is_public: true })
          .eq("id", recipeId)
        
        if (error) throw error
        setIsPublic(true)
      }

      // 2. Intentar usar Share API Nativa (Móvil)
      if (navigator.share) {
        await navigator.share({
          title: 'Mira esta receta en Cocina',
          url: publicUrl,
        })
      } else {
        // 3. Fallback a copiar al portapapeles (Desktop)
        await navigator.clipboard.writeText(publicUrl)
        toast({
          title: "¡Enlace copiado!",
          description: "El enlace a la receta se ha copiado al portapapeles.",
        })
      }
      
      router.refresh()
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error(error)
        toast({ title: "Error al compartir", variant: "destructive" })
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleUnpublish = async () => {
    setIsLoading(true)
    
    const { error } = await supabase
      .from("recipes")
      .update({ is_public: false })
      .eq("id", recipeId)
      
    if (error) {
      setIsLoading(false)
      toast({ title: "Error", description: "No se pudo despublicar la receta.", variant: "destructive" })
      return
    }
    
    setIsPublic(false)
    setIsLoading(false)
    toast({
      title: "Receta privada",
      description: "Tu receta ya no es visible públicamente.",
    })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      
      {/* 1. Botón Principal: Añadir a Libro (Componente existente) */}
      <AddRecipeToCookbook recipeId={recipeId} />

      {/* 2. Botón Principal: Compartir/Publicar */}
      {!isComponent && (
        <Button 
          onClick={handleShare} 
          disabled={isLoading} 
          variant={isPublic ? "secondary" : "default"}
          className="gap-2 transition-all active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPublic ? (
            <Share2 className="h-4 w-4" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{isPublic ? "Compartir" : "Publicar"}</span>
          {/* En móvil mostramos texto solo si no es pública para animar a publicar */}
          <span className="sm:hidden">{!isPublic && "Publicar"}</span>
        </Button>
      )}

      {/* 3. Menú de Opciones ("Más...") */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Más opciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Opciones de receta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href={`/recipes/edit/${recipeId}`} className="cursor-pointer w-full flex items-center">
              <PenSquare className="mr-2 h-4 w-4" />
              <span>Editar receta</span>
            </Link>
          </DropdownMenuItem>

          {link && (
            <DropdownMenuItem asChild>
              <a href={link} target="_blank" rel="noopener noreferrer" className="cursor-pointer w-full flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Ver fuente original</span>
              </a>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
             <Link href={`/recipes/${recipeId}/print`} className="cursor-pointer w-full flex items-center">
              <Printer className="mr-2 h-4 w-4" />
              <span>Imprimir vista</span>
            </Link>
          </DropdownMenuItem>
          
          {isPublic && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                <Link2 className="mr-2 h-4 w-4" />
                <span>Copiar enlace</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleUnpublish} 
                className="text-destructive focus:text-destructive cursor-pointer"
                disabled={isLoading}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                <span>Hacer privada</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}