// components/recipe-actions.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { PenSquare, ExternalLink, Share2, Globe, XCircle, Loader2 } from "lucide-react"
// --- 1. IMPORTAR EL NUEVO COMPONENTE ---
import { AddRecipeToCookbook } from "@/components/AddRecipeToCookbook"

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

  const publicUrl = `${window.location.origin}/profile/recipe/${recipeId}`

  const handleShare = async () => {
    setIsLoading(true)
    
    if (!isPublic) {
      const { error } = await supabase
        .from("recipes")
        .update({ is_public: true })
        .eq("id", recipeId)
      
      if (error) {
        setIsLoading(false)
        toast({ title: "Error", description: "Could not make recipe public.", variant: "destructive" })
        return
      }
    }
    
    navigator.clipboard.writeText(publicUrl)
    
    setIsPublic(true)
    setIsLoading(false)
    toast({
      title: "Recipe Published & Link Copied!",
      description: "Your recipe is now public and the link is in your clipboard.",
    })
    router.refresh()
  }
  
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
    
    setIsPublic(false)
    setIsLoading(false)
    toast({
      title: "Recipe is now Private",
      description: "Your recipe is no longer publicly visible.",
    })
    router.refresh()
  }

  return (
    <div className="flex gap-3 flex-shrink-0">
      
      {/* --- 2. AÑADIR EL NUEVO BOTÓN/POPOVER --- */}
      <AddRecipeToCookbook recipeId={recipeId} />
      {/* ------------------------------------- */}
      
      {/* --- Lógica de Botón Condicional --- */}
      {isPublic ? (
        <>
          <Button onClick={handleUnpublish} disabled={isLoading} variant="outline" className="hidden md:inline-flex">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
            Unpublish
          </Button>
          <Button onClick={handleUnpublish} disabled={isLoading} variant="outline" size="icon" className="md:hidden">
            <XCircle className="h-4 w-4" />
          </Button>

          <Button onClick={handleShare} disabled={isLoading} className="hidden md:inline-flex">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Copy Link
          </Button>
           <Button onClick={handleShare} disabled={isLoading} size="icon" className="md:hidden">
            <Share2 className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
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