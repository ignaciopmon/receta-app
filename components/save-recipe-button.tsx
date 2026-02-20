// components/save-recipe-button.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SaveRecipeButtonProps {
  recipeId: string
  initialIsSaved: boolean
  currentUserId?: string
}

export function SaveRecipeButton({ recipeId, initialIsSaved, currentUserId }: SaveRecipeButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [isSaved, setIsSaved] = useState(initialIsSaved)

  const handleToggleSave = async () => {
    // Si no tiene cuenta, lo llevamos al login
    if (!currentUserId) {
      router.push("/auth/login")
      return
    }

    // Optimistic UI: Cambiamos el icono al instante
    const newSavedState = !isSaved
    setIsSaved(newSavedState)

    try {
      if (newSavedState) {
        const { error } = await supabase.from("saved_recipes").insert({ user_id: currentUserId, recipe_id: recipeId })
        if (error) throw error
        toast({ title: "Saved to your collection" })
      } else {
        const { error } = await supabase.from("saved_recipes").delete().eq("user_id", currentUserId).eq("recipe_id", recipeId)
        if (error) throw error
        toast({ title: "Removed from saved recipes" })
      }
      router.refresh()
    } catch (error) {
      console.error(error)
      // Si falla, revertimos el botón
      setIsSaved(!newSavedState)
      toast({ title: "Error", description: "Could not update saved status.", variant: "destructive" })
    }
  }

  return (
    <Button 
      variant={isSaved ? "secondary" : "outline"} 
      size="sm" 
      onClick={handleToggleSave}
      className={cn(
        "h-8 rounded-full gap-1.5 transition-all px-4",
        isSaved 
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15" 
          : "border-border/60 hover:bg-muted"
      )}
    >
      <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
      <span className="text-xs font-medium">{isSaved ? "Saved" : "Save Recipe"}</span>
    </Button>
  )
}