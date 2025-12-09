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
  XCircle, 
  Loader2, 
  Printer,
  MoreHorizontal,
  EyeOff
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

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = `${origin}/profile/recipe/${recipeId}`

  const handleShare = async () => {
    setIsLoading(true)
    
    try {
      if (!isPublic) {
        const { error } = await supabase
          .from("recipes")
          .update({ is_public: true })
          .eq("id", recipeId)
        
        if (error) throw error
        setIsPublic(true)
      }

      if (navigator.share) {
        await navigator.share({
          title: 'Check out this recipe',
          url: publicUrl,
        })
      } else {
        await navigator.clipboard.writeText(publicUrl)
        toast({
          title: "Link Copied",
          description: "Recipe link ready to share.",
        })
      }
      
      router.refresh()
    } catch (error) {
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
      toast({ title: "Error", description: "Could not update recipe.", variant: "destructive" })
      return
    }
    
    setIsPublic(false)
    setIsLoading(false)
    toast({
      title: "Recipe Private",
      description: "Recipe is no longer public.",
    })
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-shrink-0 flex-wrap justify-center items-center">
      
      <AddRecipeToCookbook recipeId={recipeId} />

      {/* --- DESKTOP VIEW (Intacto) --- */}
      <Button asChild variant="outline" className="hidden md:inline-flex" title="Print">
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
              <Button onClick={handleShare} disabled={isLoading} variant="outline" className="hidden md:inline-flex">
                 {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                 <span className="ml-2">Share Link</span>
              </Button>
            </>
          ) : (
            <Button onClick={handleShare} disabled={isLoading} className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
               {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
               <span className="ml-2">Publish & Share</span>
            </Button>
          )}
        </>
      )}

      <Button asChild variant="outline" className="hidden md:inline-flex">
        <Link href={`/recipes/edit/${recipeId}`}>
          <PenSquare className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      
      {link && (
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground hidden md:inline-flex">
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}

      {/* --- MOBILE VIEW (Minimalist & Elegant) --- */}
      
      {/* 1. Share/Publish (Ahora estilo Outline para no destacar "por la cara") */}
      {!isComponent && (
        <Button 
          onClick={handleShare} 
          disabled={isLoading} 
          variant="outline" // Cambio clave: ahora es outline
          className="md:hidden border-primary/20 hover:bg-primary/5" // Borde muy sutil
          size="sm"
        >
           {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPublic ? <Share2 className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
           <span className="ml-2 font-serif">{isPublic ? "Share" : "Publish"}</span>
        </Button>
      )}

      {/* 2. Menu (Tres puntos sutiles) */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 font-serif">
            <DropdownMenuLabel className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link href={`/recipes/edit/${recipeId}`} className="cursor-pointer">
                <PenSquare className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/recipes/${recipeId}/print`} className="cursor-pointer">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Link>
            </DropdownMenuItem>

            {link && (
              <DropdownMenuItem asChild>
                <a href={link} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Source
                </a>
              </DropdownMenuItem>
            )}

            {isPublic && !isComponent && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleUnpublish} className="text-muted-foreground focus:text-destructive cursor-pointer">
                  <EyeOff className="mr-2 h-4 w-4" />
                  Make Private
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  )
}