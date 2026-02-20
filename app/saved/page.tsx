// app/saved/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { PublicRecipeCard } from "@/components/public-recipe-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Bookmark, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function SavedRecipesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Obtenemos los guardados cruzando con la tabla de recetas
  const { data: savedData, error } = await supabase
    .from("saved_recipes")
    .select("recipes(*)")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false })

  if (error) console.error("Error fetching saved recipes:", error)

  // RLS filtra automáticamente las recetas que han sido borradas o hechas privadas.
  // Filtramos nulls por si acaso.
  const validRecipes = savedData?.map(s => s.recipes).filter(r => r !== null) || []

  // Obtenemos los nombres de usuario de los creadores
  const authorIds = [...new Set(validRecipes.map(r => r.user_id))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", authorIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p.username]))

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      
      <main className="flex-1 w-full pb-20">
        <div className="w-full bg-muted/30 border-b border-border/40 py-12 mb-12">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center justify-center p-3 bg-background rounded-full shadow-sm mb-6 text-primary">
               <Bookmark className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground tracking-tight">
              Saved Recipes
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Your personal collection of recipes from other chefs. If the author makes them private, they will disappear from here.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          {validRecipes.length === 0 ? (
            <Empty className="py-16 border-none bg-transparent shadow-none">
              <EmptyMedia variant="icon" className="bg-muted p-6 rounded-full mb-6">
                <Bookmark className="h-10 w-10 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-bold mb-2">
                No saved recipes yet
              </EmptyTitle>
              <EmptyDescription className="max-w-md text-base mb-6">
                Explore the community and save your favorite recipes here.
              </EmptyDescription>
              <Button asChild size="lg" variant="outline" className="rounded-full shadow-sm">
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Find Chefs
                </Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {validRecipes.map((recipe) => (
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
                  authorUsername={profileMap.get(recipe.user_id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}