// app/profile/cookbook/[id]/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { PublicRecipeCard } from "@/components/public-recipe-card"
import { PublicCookbookCard } from "@/components/PublicCookbookCard"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CookingPot, User, BookOpen } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PublicCookbookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cookbook, error: cookbookError } = await supabase
    .from("cookbooks")
    .select("*, cover_color, cover_text, cover_url") 
    .eq("id", id)
    .eq("is_public", true)
    .single()

  if (cookbookError || !cookbook) {
    notFound()
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", cookbook.user_id)
    .single()

  const username = profile?.username || "Unknown User"

  const { data: recipesData, error: recipesError } = await supabase
    .from("cookbook_recipes")
    .select("recipes(*)")
    .eq("cookbook_id", id)
    .eq("recipes.is_public", true)
    .is("recipes.deleted_at", null)
    .order("added_at", { ascending: false })

  const recipes = recipesData?.map(item => item.recipes).filter(Boolean) || []

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <PublicHeader />
      
      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <div className="w-full bg-muted/30 border-b border-border/40 pb-12 pt-8">
          <div className="container mx-auto px-4">
            <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground rounded-full">
              <Link href={`/profile/${encodeURIComponent(username)}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to @{username}'s profile
              </Link>
            </Button>

            <div className="grid md:grid-cols-[300px_1fr] gap-10 items-start max-w-6xl mx-auto">
              
              {/* Libro Visual */}
              <div className="flex justify-center md:justify-start">
                 <div className="transform scale-105 md:scale-110 origin-top cursor-default pointer-events-none">
                    <PublicCookbookCard
                      id={cookbook.id}
                      name={cookbook.name}
                      description={null}
                      recipeCount={recipes.length}
                      username={username}
                      isPublic={true}
                      cover_color={cookbook.cover_color}
                      cover_text={cookbook.cover_text}
                      cover_url={cookbook.cover_url}
                    />
                 </div>
              </div>

              {/* Detalles */}
              <div className="space-y-6 md:pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border w-fit">
                    <User className="h-4 w-4" />
                    <span>Curated by <Link href={`/profile/${encodeURIComponent(username)}`} className="font-medium text-foreground hover:underline">@{username}</Link></span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight text-balance">
                    {cookbook.name}
                  </h1>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {cookbook.description || "A public collection of recipes."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* RECIPES GRID */}
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
             <h2 className="font-serif text-2xl font-bold flex items-center gap-3">
               Featured Recipes
               <span className="text-sm font-sans font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                 {recipes.length}
               </span>
             </h2>
          </div>

          {recipes.length === 0 ? (
             <Empty className="py-16 border-none">
              <EmptyMedia variant="icon" className="bg-muted/50 p-6 rounded-full mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-xl font-serif font-semibold">
                This cookbook is empty
              </EmptyTitle>
              <EmptyDescription>
                This cookbook doesn't have any public recipes in it yet.
              </EmptyDescription>
            </Empty>
          ) : (
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          )}
        </div>
      </main>
    </div>
  )
}