// components/recipe-actions.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { PenSquare, ExternalLink, Share2, Globe, XCircle, Loader2, Printer } from "lucide-react"
import { AddRecipeToCookbook } from "@/components/AddRecipeToCookbook"

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

  const publicUrl = `${window.location.origin}/profile/recipe/${recipeId}`

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
          title: 'Check out this recipe on Cocina',
          text: 'I found this great recipe!',
          url: publicUrl,
        })
        toast({ title: "Shared successfully!" })
      } else {
        // 3. Fallback a copiar al portapapeles (Desktop)
        await navigator.clipboard.writeText(publicUrl)
        toast({
          title: "Link Copied!",
          description: "Recipe link copied to clipboard.",
        })
      }
      
      router.refresh()
    } catch (error) {
      // Ignorar error si el usuario cancela el share nativo
      if ((error as Error).name !== 'AbortError') {
        console.error(error)
        toast({ title: "Error sharing", variant: "destructive" })
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
    <div className="flex gap-3 flex-shrink-0 flex-wrap justify-center">
      
      <AddRecipeToCookbook recipeId={recipeId} />

      {/* Botón de Impresión (Oculto en móvil a veces, pero útil si tienes impresora wifi) */}
      <Button asChild variant="outline" className="hidden md:inline-flex" title="Print Recipe">
        <Link href={`/recipes/${recipeId}/print`}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Link>
      </Button>
      
      {!isComponent && (
        <>
          {isPublic ? (
            <>
              <Button onClick={handleUnpublish} disabled={isLoading} variant="outline" className="hidden md:inline-flex">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Unpublish
              </Button>
              
              {/* Botón Share unificado */}
              <Button onClick={handleShare} disabled={isLoading} variant="outline">
                 {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                 <span className="ml-2 md:hidden">Share</span>
                 <span className="hidden md:inline ml-2">Share Link</span>
              </Button>
            </>
          ) : (
            <Button onClick={handleShare} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
               {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
               <span className="ml-2">Publish & Share</span>
            </Button>
          )}
        </>
      )}

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
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  )
}