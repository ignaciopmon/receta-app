// app/profile/[username]/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { PublicRecipeCard } from "@/components/public-recipe-card"
import { PublicCookbookCard } from "@/components/PublicCookbookCard"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { User, NotebookPen, BookOpen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const supabase = await createClient()

  const { username: encodedUsername } = await params
  const username = decodeURIComponent(encodedUsername)
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single() 

  if (profileError || !profile) {
    notFound()
  }
  
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .is("deleted_at", null)
    .eq("is_component", false) // <--- FILTRO AÑADIDO: Ocultar sub-recetas del perfil público
    .order("created_at", { ascending: false })

  if (recipesError) {
    console.error("Error fetching recipes:", recipesError)
  }
  
  const { data: cookbooks, error: cookbooksError } = await supabase
    .from("cookbooks")
    .select("*, cover_color, cover_text, cover_url, cookbook_recipes(count)")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  if (cookbooksError) {
    console.error("Error fetching cookbooks:", cookbooksError)
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
          
          <Tabs defaultValue="recipes" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-6">
              <TabsTrigger value="recipes">Recipes ({recipes?.length || 0})</TabsTrigger>
              <TabsTrigger value="cookbooks">Cookbooks ({cookbooks?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recipes">
              {recipes && recipes.length > 0 ? (
                <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                      @{profile.username} hasn't published any recipes yet.
                    </EmptyDescription>
                  </Empty>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cookbooks">
              {cookbooks && cookbooks.length > 0 ? (
                <div className="grid gap-8 md:gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {cookbooks.map((cookbook) => (
                    <PublicCookbookCard
                      key={cookbook.id}
                      id={cookbook.id}
                      name={cookbook.name}
                      description={cookbook.description}
                      cover_color={cookbook.cover_color}
                      cover_text={cookbook.cover_text}
                      cover_url={cookbook.cover_url}
                      recipeCount={cookbook.cookbook_recipes[0]?.count || 0}
                      username={profile.username}
                    />
                  ))}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <Empty className="py-16">
                    <EmptyMedia variant="icon"><BookOpen className="h-12 w-12" /></EmptyMedia>
                    <EmptyTitle className="text-2xl font-serif font-semibold">
                      No public cookbooks yet
                    </EmptyTitle> 
                    <EmptyDescription>
                      @{profile.username} hasn't published any cookbooks.
                    </EmptyDescription>
                  </Empty>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
        </div>
      </main>
    </div>
  )
}