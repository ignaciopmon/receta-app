"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function duplicateRecipe(recipeId: string) {
  const supabase = await createClient()

  // 1. Comprobar si el usuario está logueado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Si no está logueado, lo mandamos a loguearse
    return redirect(`/auth/login?redirect=/share/${recipeId}`)
  }

  // 2. Obtener la receta pública
  const { data: originalRecipe, error: fetchError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("is_public", true)
    .single()

  if (fetchError || !originalRecipe) {
    throw new Error("Could not find recipe to copy.")
  }

  // 3. Crear una copia para el usuario actual
  // Omitimos el id, created_at, updated_at
  const { id, created_at, updated_at, ...recipeData } = originalRecipe
  
  const { error: insertError } = await supabase.from("recipes").insert({
    ...recipeData,
    user_id: user.id, // Asignamos al nuevo usuario
    is_public: false, // La copia es privada por defecto
    name: `${recipeData.name} (Copied)`, // Añadimos "(Copied)"
  })

  if (insertError) {
    console.error("Error duplicating recipe:", insertError)
    throw new Error("Could not save the recipe to your account.")
  }

  // 4. Refrescar la página de recetas y redirigir
  revalidatePath("/recipes")
  redirect("/recipes")
}