// app/recipes/[id]/page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Star, Layers, Utensils, Flame, ChefHat } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"
import { RecipeActions } from "@/components/recipe-actions"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox" // Importamos checkbox para la UI

// Componente auxiliar para el Rating
function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-0.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
        <Star className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="text-xs font-medium text-muted-foreground">No Rating</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-0.5 px-3 py-1 rounded-full bg-yellow-50/50 border border-yellow-100/50 dark:bg-yellow-900/10 dark:border-yellow-900/20">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 ml-1.5">{rating}/5</span>
    </div>
  )
}

// Componente de cliente simple para ingredientes interactivos (simulado en servidor render para visual)
function IngredientItem({ text, index }: { text: string, index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/40 transition-colors group">
      <Checkbox id={`ingredient-${index}`} className="mt-1 data-[state=checked]:bg-primary/20 data-[state=checked]:border-primary/20 data-[state=checked]:text-primary" />
      <label 
        htmlFor={`ingredient-${index}`}
        className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary transition-colors select-none"
      >
        {text}
      </label>
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
  
  const subRecipes = components?.map((c: any) => c.recipes).filter((r: any) => r !== null) || []

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      
      <main className="flex-1 pb-20">
        {/* --- HERO SECTION --- */}
        <div className="relative w-full bg-muted/30 border-b border-border/40">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
            
            {/* Navegación Superior */}
            <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
              <Link href="/recipes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Recipes
              </Link>
            </Button>

            <div className="grid gap-8 md:grid-cols-[1fr_400px] items-start">
              
              {/* Columna Izquierda: Info Principal */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {recipe.category && (
                      <Badge variant="secondary" className="uppercase tracking-wider font-medium text-[10px] px-2 py-1">
                        {recipe.category}
                      </Badge>
                    )}
                    {recipe.difficulty && (
                      <Badge variant="outline" className="uppercase tracking-wider font-medium text-[10px] px-2 py-1 border-primary/20 text-primary/80">
                        {recipe.difficulty}
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.1] text-balance">
                    {recipe.name}
                  </h1>
                  
                  <div className="flex items-center gap-4 pt-2">
                    {!recipe.is_component && <StarRating rating={recipe.rating} />}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                   <RecipeActions
                    recipeId={recipe.id}
                    initialIsPublic={recipe.is_public}
                    link={recipe.link}
                    isComponent={recipe.is_component}
                  />
                </div>
              </div>

              {/* Columna Derecha: Imagen Hero */}
              <div className="relative aspect-[4/3] md:aspect-square w-full overflow-hidden rounded-2xl shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500 ease-out border border-border/20 bg-muted">
                {recipe.image_url ? (
                  <Image 
                    src={recipe.image_url} 
                    alt={recipe.name} 
                    fill 
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-secondary/30 text-muted-foreground/20 p-6 text-center">
                    <ChefHat className="h-20 w-20 mb-4 opacity-20" />
                    <span className="font-serif text-2xl italic opacity-40">No image provided</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* --- METADATA STRIP --- */}
        <div className="border-b border-border/40 bg-background sticky top-16 z-30 backdrop-blur-xl bg-background/80">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between md:justify-start md:gap-12 py-4 overflow-x-auto no-scrollbar">
              
              {totalTime > 0 && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Time</span>
                    <span className="font-medium text-sm">{totalTime} mins</span>
                  </div>
                </div>
              )}

              {recipe.servings && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Servings</span>
                    <span className="font-medium text-sm">{recipe.servings} ppl</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 shrink-0">
                 <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ingredients</span>
                    <span className="font-medium text-sm">{recipe.ingredients.length} items</span>
                  </div>
              </div>

               <div className="flex items-center gap-3 shrink-0">
                 <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Difficulty</span>
                    <span className="font-medium text-sm capitalize">{recipe.difficulty || "Medium"}</span>
                  </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- CONTENT SECTION (2 Columns Layout) --- */}
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[350px_1fr]">
            
            {/* COLUMNA IZQUIERDA: INGREDIENTES (Sticky en Desktop) */}
            <aside className="space-y-8">
              <div className="lg:sticky lg:top-36 space-y-8">
                {/* Sub-recetas */}
                {subRecipes.length > 0 && (
                  <Card className="border-primary/10 bg-primary/5 shadow-none overflow-hidden">
                    <CardHeader className="pb-3 bg-primary/10 border-b border-primary/10">
                      <div className="flex items-center gap-2 text-primary">
                        <Layers className="h-4 w-4" />
                        <CardTitle className="font-serif text-base">Components</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-primary/10">
                        {subRecipes.map((sub: any) => (
                          <Link key={sub.id} href={`/recipes/${sub.id}`} className="flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors">
                            <div className="relative h-10 w-10 rounded bg-background shrink-0 overflow-hidden border border-primary/10">
                              <Image 
                                src={sub.image_url || "/placeholder.svg"} 
                                alt={sub.name} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm font-medium line-clamp-1">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de Ingredientes */}
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                    Ingredients
                  </h3>
                  <div className="bg-card rounded-xl border border-border/50 shadow-sm p-2">
                    <div className="flex flex-col gap-1">
                      {recipe.ingredients.map((ingredient: string, index: number) => (
                        <IngredientItem key={index} text={ingredient} index={index} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* COLUMNA DERECHA: INSTRUCCIONES */}
            <div className="space-y-8">
              <h3 className="font-serif text-2xl font-bold border-b pb-4">Instructions</h3>
              <div className="space-y-8">
                {recipe.steps.map((step: string, index: number) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border-2 border-muted-foreground/20 text-muted-foreground font-serif font-bold text-lg group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                        {index + 1}
                      </div>
                      {/* Línea conectora excepto en el último paso */}
                      {index !== recipe.steps.length - 1 && (
                        <div className="w-px h-full bg-border my-2 group-hover:bg-primary/30 transition-colors" />
                      )}
                    </div>
                    <div className="pb-8 pt-1.5">
                      <p className="text-lg leading-relaxed text-foreground/90">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}