// app/profile/recipe/[id]/print/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PrintView } from "@/components/print-view" // Reutilizamos el mismo componente

export default async function PublicPrintRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener receta pública
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("is_public", true) 
    .is("deleted_at", null)
    .single()

  if (error || !recipe) {
    notFound()
  }

  // Obtener nombre del autor
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", recipe.user_id)
    .single()

  const username = profile?.username || "Unknown Chef"

  return (
    <PrintView 
      recipe={recipe} 
      username={username} 
      isPublicCollection={true} 
    />
  )
}