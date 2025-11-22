// app/recipes/[id]/page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Star, Layers, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"
import { RecipeActions } from "@/components/recipe-actions"
import { cn } from "@/lib/utils"

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-0.5">
        <Star className="h-4 w-4 text-muted-foreground/50" />
        <span>No Rating</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
          )}
        />
      ))}
    </div>
  )
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*") 
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .is("deleted_at", null)
    .single()

  if (recipeError || !recipe) {
    notFound()
  }
  
  const { data: components } = await supabase
    .from("recipe_components")
    .select("recipes!recipe_components_component_recipe_id_fkey(id, name, image_url, prep_time, cook_time)")
    .eq("parent_recipe_id", id)
  
  // --- CORRECCIÓN: Filtrar nulos ---
  const subRecipes = components?.map((c: any) => c.recipes).filter((r: any) => r !== null) || []

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href="/recipes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>

          <div className="space-y-6">
            {recipe.image_url && (
              <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
                <Image src={recipe.image_url || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-balance">{recipe.name}</h1>
              
              <RecipeActions
                recipeId={recipe.id}
                initialIsPublic={recipe.is_public}
                link={recipe.link}
                isComponent={recipe.is_component}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground">
              {recipe.category && <Badge variant="outline">{recipe.category}</Badge>}
              {recipe.difficulty && <Badge variant="secondary">{recipe.difficulty}</Badge>}
              
              {totalTime > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    {recipe.prep_time && `Prep: ${recipe.prep_time}m`}
                    {recipe.prep_time && recipe.cook_time && " | "}
                    {recipe.cook_time && `Cook: ${recipe.cook_time}m`}
                    {totalTime > 0 && ` (Total: ${totalTime}m)`}
                  </span>
                </div>
              )}
              
              {recipe.servings && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}

              {!recipe.is_component && (
                 <div className="flex items-center gap-1.5 text-sm">
                    <StarRating rating={recipe.rating} />
                 </div>
              )}
            </div>

            {subRecipes.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                     <Layers className="h-5 w-5 text-primary" />
                     <CardTitle className="font-serif text-lg">Includes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {subRecipes.map((sub: any) => (
                    <Link key={sub.id} href={`/recipes/${sub.id}`}>
                       <div className="flex items-center gap-3 p-2 rounded-md bg-background border hover:shadow-sm transition-all group">
                          <div className="relative h-12 w-12 rounded overflow-hidden bg-muted shrink-0">
                             <Image 
                                src={sub.image_url || "/placeholder.svg"} 
                                alt={sub.name} 
                                fill 
                                className="object-cover"
                             />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-medium truncate group-hover:text-primary transition-colors">{sub.name}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <span className="leading-relaxed">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.steps.map((step: string, index: number) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        {index + 1}
                      </div>
                      <p className="leading-relaxed pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}