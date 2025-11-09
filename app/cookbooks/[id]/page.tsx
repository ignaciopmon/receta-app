// app/cookbooks/[id]/page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { RecipeCard } from "@/components/recipe-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CookingPot, Globe, Lock, Wand2, Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

// TODO: Crear este componente cliente para manejar los botones
// import { CookbookActions } from "@/components/CookbookActions" 

export default async function CookbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // 1. Obtener el cookbook y verificar que pertenece al usuario
  const { data: cookbook, error: cookbookError } = await supabase
    .from("cookbooks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (cookbookError || !cookbook) {
    notFound()
  }

  // 2. Obtener las recetas de este cookbook
  const { data: recipesData, error: recipesError } = await supabase
    .from("cookbook_recipes")
    .select("recipes(*)") // ¡Magia de Supabase!
    .eq("cookbook_id", id)
    .is("recipes.deleted_at", null) // Asegurarse que la receta no esté borrada
    .order("added_at", { ascending: false })

  if (recipesError) {
    console.error("Error fetching recipes for cookbook:", recipesError)
    // No hacemos notFound(), solo mostramos un error
  }

  const recipes = recipesData?.map(item => item.recipes).filter(Boolean) || []

  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href="/cookbooks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Cookbooks
            </Link>
          </Button>

          <div className="mb-8 p-6 rounded-lg bg-card border">
            {/* Aquí irían las acciones */}
            {/* <CookbookActions cookbook={cookbook} /> */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">
              {cookbook.name}
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              {cookbook.description || "No description provided."}
            </p>
            <div className="flex flex-wrap items-center gap-4">
               {cookbook.is_public ? (
                <div className="flex items-center gap-1.5 text-sm text-blue-500">
                  <Globe className="h-4 w-4" />
                  <span>Public</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Private</span>
                </div>
              )}
              {/* TODO: Botón para generar portada */}
              <Button variant="outline" size="sm" disabled>
                 <Wand2 className="mr-2 h-4 w-4" />
                 Generate AI Cover
              </Button>
            </div>
          </div>
          
          {recipes.length === 0 ? (
             <Empty className="py-16">
              <EmptyMedia variant="icon"><CookingPot className="h-12 w-12" /></EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-semibold">
                This cookbook is empty
              </EmptyTitle>
              <EmptyDescription>
                Save recipes to this cookbook to see them here.
              </EmptyDescription>
            </Empty>
          ) : (
             <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  name={recipe.name}
                  ingredients={recipe.ingredients}
                  steps={recipe.steps}
                  imageUrl={recipe.image_url}
                  link={recipe.link}
                  onUpdate={() => {}} // La recarga la manejará la página
                  category={recipe.category}
                  difficulty={recipe.difficulty}
                  isFavorite={recipe.is_favorite}
                  rating={recipe.rating}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}