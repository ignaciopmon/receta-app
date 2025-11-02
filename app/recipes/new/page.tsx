import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeFormHeader } from "@/components/recipe-form-header"
import { RecipeForm } from "@/components/recipe-form"

// Volvemos a la firma simple, sin 'searchParams'
export default async function NewRecipePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", data.user.id).single()

  // Eliminamos toda la lógica de parsear la URL
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeFormHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">Add New Recipe</h1>
            {/* El texto vuelve a ser estático */}
            <p className="text-muted-foreground text-lg">Fill in the details below to save your recipe</p>
          </div>
          <RecipeForm
            // Pasamos solo las props originales
            defaultIngredientsCount={preferences?.default_ingredients_count || 3}
            defaultStepsCount={preferences?.default_steps_count || 3}
          />
        </div>
      </main>
    </div>
  )
}