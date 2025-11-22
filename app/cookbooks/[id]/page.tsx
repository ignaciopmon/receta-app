// app/cookbooks/[id]/page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { RecipeCard } from "@/components/recipe-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CookingPot, Globe, Lock, MoreHorizontal } from "lucide-react"
import { CookbookActions } from "@/components/CookbookActions"
import { Toaster } from "@/components/ui/toaster"
import { CookbookCard } from "@/components/CookbookCard" // Reutilizamos para la visualización
import { Separator } from "@/components/ui/separator"

export const dynamic = 'force-dynamic'

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

  const { data: cookbook, error: cookbookError } = await supabase
    .from("cookbooks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (cookbookError || !cookbook) {
    notFound()
  }

  const { data: recipesData, error: recipesError } = await supabase
    .from("cookbook_recipes")
    .select("recipes(*)")
    .eq("cookbook_id", id)
    .is("recipes.deleted_at", null)
    .order("added_at", { ascending: false })

  if (recipesError) {
    console.error("Error fetching recipes for cookbook:", recipesError)
  }

  const recipes = recipesData?.map(item => item.recipes).filter(Boolean) || []

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      
      <main className="flex-1 w-full">
        
        {/* --- HERO SECTION --- */}
        <div className="w-full bg-muted/30 border-b border-border/40 pb-12 pt-8">
          <div className="container mx-auto px-4">
            {/* Navegación */}
            <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground rounded-full">
              <Link href="/cookbooks">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Cookbooks
              </Link>
            </Button>

            <div className="grid md:grid-cols-[300px_1fr] gap-10 items-start max-w-6xl mx-auto">
              
              {/* Columna Izquierda: El Libro Físico (Visualización) */}
              <div className="flex justify-center md:justify-start">
                 <div className="transform scale-105 md:scale-110 origin-top cursor-default pointer-events-none">
                    {/* Usamos el componente Card pero deshabilitado como link */}
                    <CookbookCard
                      id={cookbook.id}
                      name={cookbook.name}
                      description={null} // Ocultamos descripción en la portada mini
                      recipeCount={recipes.length}
                      isPublic={cookbook.is_public}
                      cover_color={cookbook.cover_color}
                      cover_text={cookbook.cover_text}
                      cover_url={cookbook.cover_url}
                    />
                 </div>
              </div>

              {/* Columna Derecha: Detalles y Acciones */}
              <div className="space-y-6 md:pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {cookbook.is_public ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-900/30">
                        <Globe className="h-3.5 w-3.5" />
                        Public Collection
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                        <Lock className="h-3.5 w-3.5" />
                        Private Collection
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight text-balance">
                    {cookbook.name}
                  </h1>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {cookbook.description || "A collection of my favorite recipes."}
                  </p>
                </div>

                <div className="pt-2">
                  <CookbookActions cookbook={cookbook} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RECIPES GRID --- */}
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
             <h2 className="font-serif text-2xl font-bold flex items-center gap-3">
               Recipes inside
               <span className="text-sm font-sans font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                 {recipes.length}
               </span>
             </h2>
          </div>

          {recipes.length === 0 ? (
             <Empty className="py-16 border-none">
              <EmptyMedia variant="icon" className="bg-muted/50 p-6 rounded-full mb-6">
                <CookingPot className="h-10 w-10 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-xl font-serif font-semibold">
                This cookbook is empty
              </EmptyTitle>
              <EmptyDescription className="max-w-md mx-auto mt-2">
                Start adding recipes to this collection from your main recipes list. Look for the "Save to..." bookmark icon.
              </EmptyDescription>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/recipes">Go to All Recipes</Link>
              </Button>
            </Empty>
          ) : (
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard
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
          )}
        </div>
      </main>
      <Toaster />
    </div>
  )
}