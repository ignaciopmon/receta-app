"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { PenSquare, ExternalLink, Globe, XCircle, Share2, Loader2 } from "lucide-react"

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
  const [isPublishing, setIsPublishing] = useState(false)

  const handleTogglePublic = async () => {
    setIsPublishing(true)
    const newIsPublicState = !isPublic
    
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ is_public: newIsPublicState })
        .eq("id", recipeId)
      
      if (error) throw error

      setIsPublic(newIsPublicState) // Actualiza el estado local si Supabase tiene éxito
      toast({
        title: newIsPublicState ? "Recipe Published!" : "Recipe Unpublished",
        description: newIsPublicState ? "Anyone with the link can now view it." : "Your recipe is now private.",
      })
      router.refresh() // Refresca los props del servidor
    } catch (error) {
      console.error("Error updating public state:", error)
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleShare = () => {
    // Genera la URL pública directa
    const publicUrl = `${window.location.origin}/profile/recipe/${recipeId}`
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "Link Copied!",
      description: "The public link has been copied to your clipboard.",
    })
  }

  return (
    // Reemplaza el layout de botones anterior por este
    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
      
      {/* --- Botón de Publicar/Despublicar --- */}
      <Button onClick={handleTogglePublic} disabled={isPublishing}>
        {isPublishing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isPublic ? (
          <XCircle className="mr-2 h-4 w-4" />
        ) : (
          <Globe className="mr-2 h-4 w-4" />
        )}
        {isPublishing ? "Updating..." : isPublic ? "Unpublish" : "Publish"}
      </Button>

      {/* --- Botón de Compartir (solo si es pública) --- */}
      {isPublic && (
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      )}

      {/* --- Botones existentes --- */}
      <Button asChild variant="outline">
        <Link href={`/recipes/edit/${recipeId}`}>
          <PenSquare className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      
      {link && (
        <Button asChild variant="outline">
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Source
          </a>
        </Button>
      )}
    </div>
  )
}