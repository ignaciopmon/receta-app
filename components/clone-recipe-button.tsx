// components/clone-recipe-button.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { SaveAll, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CloneRecipeButtonProps {
  recipe: any
  currentUserId?: string
}

export function CloneRecipeButton({ recipe, currentUserId }: CloneRecipeButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCloning, setIsCloning] = useState(false)
  const supabase = createClient()

  // Si el usuario está viendo su propia receta pública, no mostramos el botón de clonar
  if (currentUserId === recipe.user_id) return null

  const handleClone = async () => {
    // Si no está logueado, lo mandamos a login/registro
    if (!currentUserId) {
      router.push("/auth/login")
      return
    }

    setIsCloning(true)
    try {
      const newRecipe = {
        user_id: currentUserId,
        name: `${recipe.name} (Copia)`,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        image_url: recipe.image_url,
        link: recipe.link,
        category: recipe.category,
        difficulty: recipe.difficulty,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        tags: recipe.tags,
        is_public: false, // La copia siempre empieza siendo privada
        is_favorite: false,
        is_component: recipe.is_component
      }

      const { data, error } = await supabase
        .from("recipes")
        .insert(newRecipe)
        .select("id")
        .single()

      if (error) throw error

      toast({
        title: "¡Receta Guardada!",
        description: "Se ha añadido una copia a tu cocina personal.",
      })
      
      // Redirigimos al usuario a su nueva receta clonada
      router.push(`/recipes/${data.id}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo guardar la receta.",
        variant: "destructive"
      })
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <Button 
      onClick={handleClone} 
      disabled={isCloning} 
      className="rounded-full shadow-md hover:shadow-lg transition-all px-6"
    >
      {isCloning ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <SaveAll className="mr-2 h-4 w-4" />
      )}
      Save to my Kitchen
    </Button>
  )
}