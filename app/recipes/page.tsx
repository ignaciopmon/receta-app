// app/recipes/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { RecipesClient } from "@/components/recipes-client"
import { Suspense } from "react"

// Asegura que Next.js siempre traiga datos frescos y no cachee esta página estáticamente
export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const supabase = await createClient()

  // 1. Obtenemos el usuario autenticado en el servidor
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  // 2. Traemos TODAS las recetas de forma ultra rápida directamente desde el backend
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userData.user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  // 3. Comprobamos si hay que mostrar el modal de bienvenida
  const { data: prefsData } = await supabase
    .from("user_preferences")
    .select("has_seen_welcome_modal")
    .eq("user_id", userData.user.id)
    .single()

  let welcomeUsername = ""
  let showWelcome = false

  if (prefsData && !prefsData.has_seen_welcome_modal) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userData.user.id)
      .single()
    
    if (profileData) {
      welcomeUsername = profileData.username
      showWelcome = true
    }
  }

  // 4. Servimos el HTML ya montado, ¡cero tiempos de carga para el cliente!
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      
      {/* Usamos Suspense porque el componente hijo lee los filtros de la URL */}
      <Suspense fallback={null}>
        <RecipesClient 
          initialRecipes={recipes || []}
          userId={userData.user.id}
          showWelcome={showWelcome}
          welcomeUsername={welcomeUsername}
        />
      </Suspense>
    </div>
  )
}