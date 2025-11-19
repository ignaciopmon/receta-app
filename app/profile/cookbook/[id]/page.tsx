// app/profile/cookbook/[id]/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { PublicRecipeCard } from "@/components/public-recipe-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CookingPot, User } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PublicCookbookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Obtener el cookbook (Query actualizada con cover_url)
  const { data: cookbook, error: cookbookError } = await supabase
    .from("cookbooks")
    .select("*, cover_color, cover_text, cover_url") 
    .eq("id", id)
    .eq("is_public", true)
    .single()

  if (cookbookError || !cookbook) {
    notFound()
  }

  // 2. Obtener el perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", cookbook.user_id)
    .single()

  const username = profile?.username || "Unknown User"

  // 3. Obtener las recetas
  const { data: recipesData, error: recipesError } = await supabase
    .from("cookbook_recipes")
    .select("recipes(*)")
    .eq("cookbook_id", id)
    .eq("recipes.is_public", true)
    .is("recipes.deleted_at", null)
    .order("added_at", { ascending: false })

  if (recipesError) {
    console.error("Error fetching public recipes for cookbook:", recipesError)
  }

  const recipes = recipesData?.map(item => item.recipes).filter(Boolean) || []

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href={`/profile/${encodeURIComponent(username)}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to @{username}'s profile
            </Link>
          </Button>

          <div className="mb-8 max-w-4xl mx-auto text-center">
             {/* Cabecera simple del libro */}
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-balance">
              {cookbook.name}
            </h1>
            {cookbook.description && (
                <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
                {cookbook.description}
                </p>
            )}
            <div className="flex items-center justify-center gap-1.5 text-sm">
              <User className="h-4 w-4" />
              <span>By <Link href={`/profile/${encodeURIComponent(username)}`} className="font-medium text-foreground hover:underline">@{username}</Link></span>
            </div>
          </div>
          
          {recipes.length === 0 ? (
             <Empty className="py-16 max-w-4xl mx-auto">
              <EmptyMedia variant="icon"><CookingPot className="h-12 w-12" /></EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-semibold">
                This cookbook is empty
              </EmptyTitle>
              <EmptyDescription>
                This cookbook doesn't have any public recipes in it yet.
              </EmptyDescription>
            </Empty>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  )
}