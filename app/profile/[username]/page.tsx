// app/profile/[username]/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { PublicRecipeCard } from "@/components/public-recipe-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { User, NotebookPen } from "lucide-react"

// Definición del tipo de Receta (puedes moverlo a un archivo types.ts)
interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
  image_url: string | null;
  link: string | null;
  category: string | null;
  difficulty: string | null;
  is_favorite: boolean;
  rating: number | null;
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createClient()
  const { username } = params

  // 1. Buscar el perfil por el nombre de usuario
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single()

  // Si no se encuentra el perfil, mostrar un 404
  if (profileError || !profile) {
    notFound()
  }

  // 2. Buscar las recetas PÚBLICAS de ese perfil
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", profile.id)     // Del usuario encontrado
    .eq("is_public", true)        // Que sean públicas
    .is("deleted_at", null)       // Que no estén borradas
    .order("created_at", { ascending: false })

  if (recipesError) {
    // Puedes optar por un 404 o una página de error
    console.error("Error fetching recipes:", recipesError)
    notFound()
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-10 w-10 text-muted-foreground" />
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-balance">@{profile.username}</h1>
                <p className="text-muted-foreground text-lg">
                  Public recipe collection
                </p>
              </div>
            </div>
          </div>

          {recipes.length > 0 ? (
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {recipes.map((recipe) => (
                <PublicRecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  name={recipe.name}
                  ingredients={recipe.ingredients}
                  steps={recipe.steps}
                  imageUrl={recipe.image_url}
                  link={recipe.link}
                  category={recipe.category}
                  difficulty={recipe.difficulty}
                  isFavorite={recipe.is_favorite}
                  rating={recipe.rating}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Empty className="py-16">
                <EmptyMedia variant="icon"><NotebookPen className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle className="text-2xl font-serif font-semibold">
                  No public recipes yet
                </EmptyTitle>
                <EmptyDescription>
                  @{profile.username} hasn't published any recipes yet. Check back later!
                </EmptyDescription>
              </Empty>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}