// components/trash-section.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArchiveRestore, Undo2, Trash2, Clock } from "lucide-react"

interface Recipe {
  id: string
  name: string
  deleted_at: string
}

export function TrashSection({ deletedRecipes }: { deletedRecipes: Recipe[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleRestore = async (recipeId: string) => {
    setIsRestoring(recipeId)
    try {
      const { error } = await supabase.from("recipes").update({ deleted_at: null }).eq("id", recipeId)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error restoring recipe:", error)
    } finally {
      setIsRestoring(null)
    }
  }

  const handlePermanentDelete = async (recipeId: string) => {
    if (!confirm("This action is irreversible. Are you sure?")) return

    setIsDeleting(recipeId)
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", recipeId)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting recipe:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5 shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1 text-destructive">
          <ArchiveRestore className="h-5 w-5" />
          <CardTitle className="font-serif text-xl">Trash</CardTitle>
        </div>
        <CardDescription>
          Restore recipes you've deleted or remove them permanently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deletedRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground opacity-60">
            <Trash2 className="h-10 w-10 mb-3 stroke-1" />
            <p className="text-sm">Your trash is empty.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deletedRecipes.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background hover:bg-accent/20 transition-colors">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="font-medium truncate">{recipe.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>Deleted on {new Date(recipe.deleted_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(recipe.id)}
                    disabled={isRestoring === recipe.id}
                    className="h-8"
                  >
                    <Undo2 className="h-3.5 w-3.5 mr-1.5" />
                    Restore
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handlePermanentDelete(recipe.id)}
                    disabled={isDeleting === recipe.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}