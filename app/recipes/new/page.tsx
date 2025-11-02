import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeFormHeader } from "@/components/recipe-form-header"
import { RecipeForm } from "@/components/recipe-form"

// 1. Actualizar la firma para aceptar 'searchParams'
export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", data.user.id).single()

  // 2. Parsear los datos de la URL
  const initialName = searchParams.name as string || ""
  const initialLink = searchParams.link as string || ""
  const initialCategory = searchParams.category as string || null
  const initialDifficulty = searchParams.difficulty as string || null
  
  // Manejar ingredientes (puede ser uno o muchos)
  const ingredientsParam = searchParams.ingredients
  const initialIngredients = Array.isArray(ingredientsParam) 
    ? ingredientsParam 
    : (ingredientsParam ? [ingredientsParam] : undefined)

  // Manejar pasos (puede ser uno o muchos)
  const stepsParam = searchParams.steps
  const initialSteps = Array.isArray(stepsParam)
    ? stepsParam
    : (stepsParam ? [stepsParam] : undefined)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeFormHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">Add New Recipe</h1>
            <p className="text-muted-foreground text-lg">
              {initialName ? "Review the imported recipe" : "Fill in the details below to save your recipe"}
            </p>
          </div>
          <RecipeForm
            // 3. Pasar los datos parseados al formulario
            defaultIngredientsCount={preferences?.default_ingredients_count || 3}
            defaultStepsCount={preferences?.default_steps_count || 3}
            initialName={initialName}
            initialLink={initialLink}
            initialCategory={initialCategory}
            initialDifficulty={initialDifficulty}
            initialIngredients={initialIngredients}
            initialSteps={initialSteps}
          />
        </div>
      </main>
    </div>
  )
}