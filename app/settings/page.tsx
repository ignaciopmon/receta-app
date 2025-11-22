// app/settings/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsHeader } from "@/components/settings-header"
import { SettingsForm } from "@/components/settings-form"
import { TrashSection } from "@/components/trash-section"
import { AccountForm } from "@/components/account-form"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", data.user.id).single()

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", data.user.id)
    .single()

  const { data: deletedRecipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", data.user.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <SettingsHeader />
      
      <main className="flex-1 w-full pb-20">
        {/* Cabecera de Sección */}
        <div className="w-full bg-muted/30 border-b border-border/40 py-12 mb-12">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h1 className="text-4xl font-serif font-bold mb-3 text-foreground tracking-tight">
              Settings
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage your account preferences, customize your experience, and recover deleted items.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl space-y-10">
          
          {/* Sección Cuenta */}
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-semibold px-1">Account & Session</h2>
            <AccountForm
              initialUsername={profile?.username || ''}
              userId={data.user.id}
            />
          </section>

          <Separator className="opacity-50" />

          {/* Sección Preferencias */}
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-semibold px-1">App Preferences</h2>
            <SettingsForm
              initialTheme={preferences?.theme || "light"}
              initialIngredientsCount={preferences?.default_ingredients_count || 3}
              initialStepsCount={preferences?.default_steps_count || 3}
              userId={data.user.id}
            />
          </section>

          <Separator className="opacity-50" />

          {/* Sección Papelera */}
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-semibold px-1 text-destructive/80">Danger Zone</h2>
            <TrashSection deletedRecipes={deletedRecipes || []} />
          </section>

        </div>
      </main>
    </div>
  )
}