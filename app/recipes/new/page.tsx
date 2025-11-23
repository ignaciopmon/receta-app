// app/recipes/new/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeFormHeader } from "@/components/recipe-form-header"
import { RecipeForm } from "@/components/recipe-form"

export default async function NewRecipePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", data.user.id).single()

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeFormHeader />
      
      <main className="flex-1 w-full pb-20">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
              New Creation
            </h1>
            <p className="text-muted-foreground text-lg font-light">
              Document your culinary masterpiece.
            </p>
          </div>

          <RecipeForm
            defaultIngredientsCount={preferences?.default_ingredients_count || 3}
            defaultStepsCount={preferences?.default_steps_count || 3}
          />
        </div>
      </main>
    </div>
  )
}