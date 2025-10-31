import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeFormHeader } from "@/components/recipe-form-header"
import { RecipeForm } from "@/components/recipe-form"

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch the recipe to edit
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .is("deleted_at", null) // <-- ¡AQUÍ ESTÁ LA CORRECCIÓN!
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeFormHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2 text-balance">Edit Recipe</h1>
            <p className="text-muted-foreground text-lg">Update your recipe details</p>
          </div>
          <RecipeForm
            recipeId={recipe.id}
            initialName={recipe.name}
            initialIngredients={recipe.ingredients}
            initialSteps={recipe.steps}
            initialLink={recipe.link}
            initialImageUrl={recipe.image_url}
          />
        </div>
      </main>
    </div>
  )
}