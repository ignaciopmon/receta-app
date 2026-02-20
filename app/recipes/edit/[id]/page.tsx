// app/recipes/edit/[id]/page.tsx

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
    .is("deleted_at", null)
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeFormHeader />
      
      <main className="flex-1 w-full pb-20">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
              Edit Recipe
            </h1>
            <p className="text-muted-foreground text-lg font-light">
              Refining "{recipe.name}"
            </p>
          </div>

          <RecipeForm
            recipeId={recipe.id}
            initialName={recipe.name}
            initialIngredients={recipe.ingredients}
            initialSteps={recipe.steps}
            initialLink={recipe.link}
            initialImageUrl={recipe.image_url}
            initialCategory={recipe.category}
            initialDifficulty={recipe.difficulty}
            initialIsFavorite={recipe.is_favorite}
            initialRating={recipe.rating}
            initialPrepTime={recipe.prep_time}
            initialCookTime={recipe.cook_time}
            initialServings={recipe.servings}
            initialIsComponent={recipe.is_component} 
            initialTags={recipe.tags} // PASAMOS LAS ETIQUETAS A LA UI
          />
        </div>
      </main>
    </div>
  )
}