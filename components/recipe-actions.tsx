"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { PenSquare, ExternalLink, Share2, Globe, XCircle, Loader2 } from "lucide-react"

interface RecipeActionsProps {
  recipeId: string
  initialIsPublic: boolean
  link: string | null
}

export function RecipeActions({ recipeId, initialIsPublic, link }: RecipeActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [isLoading, setIsLoading] = useState(false)

  // Esta es la URL pública directa a la receta
  const publicUrl = `${window.location.origin}/profile/recipe/${recipeId}`

  /**
   * Lógica para el botón de COMPARTIR
   * 1. Hace la receta pública en la DB
   * 2. Copia la URL al portapapeles
   * 3. Muestra un toast y actualiza el estado
   */
  const handleShare = async () => {
    setIsLoading(true)
    
    // 1. Hacer pública (si no lo es ya)
    if (!isPublic) {
      // --- CORRECCIÓN AQUÍ ---
      // Se eliminó el '_' extra después de { error }
      const { error } = await supabase
      // --- FIN DE LA CORRECCIÓN ---
        .from("recipes")
        .update({ is_public: true })
        .eq("id", recipeId)
      
      if (error) {
        setIsLoading(false)
        toast({ title: "Error", description: "Could not make recipe public.", variant: "destructive" })
        return
      }
    }
    
    // 2. Copiar al portapapeles
    navigator.clipboard.writeText(publicUrl)
    
    // 3. Notificar y actualizar estado
    setIsPublic(true) // Asegura que el estado local esté actualizado
    setIsLoading(false)
    toast({
      title: "Recipe Published & Link Copied!",
      description: "Your recipe is now public and the link is in your clipboard.",
    })
    router.refresh() // Actualiza el estado del servidor
  }
  
  /**
   * Lógica para el botón de DESPUBLICAR
   * 1. Hace la receta privada en la DB
   * 2. Muestra un toast y actualiza el estado
   */
  const handleUnpublish = async () => {
    setIsLoading(true)
    
    const { error } = await supabase
      .from("recipes")
      .update({ is_public: false })
      .eq("id", recipeId)
      
    if (error) {
      setIsLoading(false)
      toast({ title: "Error", description: "Could not unpublish recipe.", variant: "destructive" })
      return
    }
    
    setIsPublic(false) // Actualiza el estado local
    setIsLoading(false)
    toast({
      title: "Recipe is now Private",
      description: "Your recipe is no longer publicly visible.",
    })
    router.refresh() // Actualiza el estado del servidor
  }

  return (
    // Contenedor que imita el layout anterior (botones en escritorio, iconos en móvil)
    <div className="flex gap-3 flex-shrink-0">
      
      {/* --- Lógica de Botón Condicional --- */}
      {isPublic ? (
        // --- YA ES PÚBLICA ---
        <>
          {/* Botón de Despublicar */}
          <Button onClick={handleUnpublish} disabled={isLoading} variant="outline" className="hidden md:inline-flex">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
            Unpublish
          </Button>
          <Button onClick={handleUnpublish} disabled={isLoading} variant="outline" size="icon" className="md:hidden">
            <XCircle className="h-4 w-4" />
          </Button>

          {/* Botón de Compartir (ya es pública, solo copia) */}
          <Button onClick={handleShare} disabled={isLoading} className="hidden md:inline-flex">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Copy Link
          </Button>
           <Button onClick={handleShare} disabled={isLoading} size="icon" className="md:hidden">
            <Share2 className="h-4 w-4" />
          </Button>
        </>
      ) : (
        // --- ES PRIVADA ---
        <>
          {/* Botón de Publicar y Compartir */}
          <Button onClick={handleShare} disabled={isLoading} className="hidden md:inline-flex">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
            Publish & Share
          </Button>
          <Button onClick={handleShare} disabled={isLoading} size="icon" className="md:hidden">
            <Globe className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* --- Botones de Editar y Fuente (como antes) --- */}
      <Button asChild variant="outline" size="icon" className="md:hidden">
        <Link href={`/recipes/edit/${recipeId}`}>
          <PenSquare className="h-4 w-4" />
        </Link>
      </Button>
      <Button asChild variant="outline" className="hidden md:inline-flex">
        <Link href={`/recipes/edit/${recipeId}`}>
          <PenSquare className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      
      {link && (
        <>
          <Button asChild variant="outline" size="icon" className="md:hidden">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Source
            </a>
          </Button>
        </>
      )}
    </div>
  )
}