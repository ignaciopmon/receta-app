"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// --- ICONOS ACTUALIZADOS ---
import { Archive, Undo2, Flame } from "lucide-react"

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
    if (!confirm("Are you sure you want to permanently delete this recipe? This action cannot be undone.")) {
      return
    }

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {/* --- ICONO CAMBIADO --- */}
          <Archive className="h-5 w-5" />
          <CardTitle>Trash</CardTitle>
        </div>
        <CardDescription>
          {deletedRecipes.length === 0
            ? "No deleted recipes"
            : `${deletedRecipes.length} deleted ${deletedRecipes.length === 1 ? "recipe" : "recipes"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deletedRecipes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Your trash is empty</p>
        ) : (
          <div className="space-y-3">
            {deletedRecipes.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <p className="font-medium">{recipe.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Deleted {new Date(recipe.deleted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(recipe.id)}
                    disabled={isRestoring === recipe.id}
                  >
                    {/* --- ICONO CAMBIADO --- */}
                    <Undo2 className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handlePermanentDelete(recipe.id)}
                    disabled={isDeleting === recipe.id}
                  >
                    {/* --- ICONO CAMBIADO --- */}
                    <Flame className="h-4 w-4" />
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