import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsHeader } from "@/components/settings-header"
import { SettingsForm } from "@/components/settings-form"
import { TrashSection } from "@/components/trash-section"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user preferences
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", data.user.id).single()

  // Fetch deleted recipes
  const { data: deletedRecipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", data.user.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SettingsHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <h1 className="text-4xl font-serif font-bold mb-8 text-balance">Settings</h1>

          <div className="space-y-8">
            <SettingsForm
              initialTheme={preferences?.theme || "light"}
              initialIngredientsCount={preferences?.default_ingredients_count || 3}
              initialStepsCount={preferences?.default_steps_count || 3}
              userId={data.user.id}
            />

            <TrashSection deletedRecipes={deletedRecipes || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
