"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, Loader2 } from "lucide-react"
import { duplicateRecipe } from "@/app/actions/duplicate-recipe"

export function SaveRecipeButton({ recipeId }: { recipeId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      try {
        await duplicateRecipe(recipeId)
      } catch (error) {
        console.error(error)
        alert((error as Error).message)
      }
    })
  }

  return (
    <Button size="lg" onClick={handleSave} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className="mr-2 h-4 w-4" />
      )}
      Save to my Cocina
    </Button>
  )
}