// app/recipes/[id]/page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, Users, Star, Layers, Utensils, Flame, ChefHat } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"
import { RecipeActions } from "@/components/recipe-actions"

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
        <Star className="h-3 w-3" />
        <span className="text-[10px] font-medium uppercase tracking-wider">No Rating</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-100/50 text-yellow-700 border border-yellow-200/50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30">
      <Star className="h-3 w-3 fill-current" />
      <span className="text-xs font-bold">{rating}</span>
      <span className="text-[10px] opacity-70">/ 5</span>
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col items-center justify-center px-4 py-2 min-w-[80px] border-r border-border/50 last:border-0">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

function IngredientItem({ text, index }: { text: string, index: number }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0 group hover:bg-muted/30 transition-colors px-2 rounded-md -mx-2">
      <Checkbox id={`ing-${index}`} className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
      <label htmlFor={`ing-${index}`} className="text-base leading-relaxed text-foreground/90 peer-disabled:opacity-70 cursor-pointer select-none group-hover:text-foreground transition-colors">{text}</label>
    </div>
  )
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData?.user) redirect("/auth/login")

  const { data: recipe, error: recipeError } = await supabase.from("recipes").select("*").eq("id", id).eq("user_id", userData.user.id).is("deleted_at", null).single()

  if (recipeError || !recipe) notFound()
  
  const { data: components } = await supabase.from("recipe_components").select("recipes!recipe_components_component_recipe_id_fkey(id, name, image_url)").eq("parent_recipe_id", id)
  
  const subRecipes = components?.map((c: any) => c.recipes).filter((r: any) => r !== null) || []
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto pt-8 pb-6 px-4 md:pt-12 md:px-6 text-center">
          <div className="flex justify-center mb-6">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-full">
              <Link href="/recipes"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to Recipes</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {recipe.category && <Badge variant="secondary" className="rounded-full px-3 font-medium text-muted-foreground bg-secondary">{recipe.category}</Badge>}
            {recipe.difficulty && <Badge variant="outline" className="rounded-full px-3 font-medium border-muted-foreground/30 text-muted-foreground">{recipe.difficulty}</Badge>}
            {!recipe.is_component && <StarRating rating={recipe.rating} />}
            
            {/* RENDERIZADO DE ETIQUETAS AQUÍ */}
            {recipe.tags && recipe.tags.length > 0 && recipe.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="rounded-full px-3 font-medium border-muted-foreground/30 text-muted-foreground">
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight tracking-tight text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">{recipe.name}</h1>

          <div className="flex flex-wrap items-center justify-center gap-y-4 border-y border-border/60 py-4 mb-8 bg-card/50 backdrop-blur-sm rounded-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 w-fit mx-auto shadow-sm">
            <MetaItem icon={Clock} label="Total Time" value={totalTime > 0 ? `${totalTime} min` : null} />
            <MetaItem icon={Utensils} label="Prep" value={recipe.prep_time ? `${recipe.prep_time} min` : null} />
            <MetaItem icon={Flame} label="Cook" value={recipe.cook_time ? `${recipe.cook_time} min` : null} />
            <MetaItem icon={Users} label="Serves" value={recipe.servings ? `${recipe.servings} pp` : null} />
          </div>

          <div className="flex justify-center animate-in zoom-in-95 duration-500 delay-300">
             <RecipeActions recipeId={recipe.id} initialIsPublic={recipe.is_public} link={recipe.link} isComponent={recipe.is_component} />
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 mb-12">
          <div className="relative aspect-video md:aspect-[21/9] w-full overflow-hidden rounded-xl shadow-lg border border-border/30 bg-muted group">
            {recipe.image_url ? (
              <Image src={recipe.image_url} alt={recipe.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-secondary/30 text-muted-foreground/20">
                <ChefHat className="h-24 w-24 mb-4 opacity-20" /><span className="font-serif text-2xl italic opacity-40">Bon Appétit</span>
              </div>
            )}
          </div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 pb-20">
          <div className="grid gap-12 lg:grid-cols-[320px_1fr] items-start">
            <aside className="space-y-8">
              {subRecipes.length > 0 && (
                <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
                  <div className="px-4 py-3 border-b border-primary/10 flex items-center gap-2 text-primary font-serif font-bold"><Layers className="h-4 w-4" />Required Components</div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-primary/10">
                      {subRecipes.map((sub: any) => (
                        <Link key={sub.id} href={`/recipes/${sub.id}`} className="flex items-center gap-3 p-3 hover:bg-primary/10 transition-colors">
                          <div className="relative h-10 w-10 rounded bg-background shrink-0 overflow-hidden border border-primary/10">
                            <Image src={sub.image_url || "/placeholder.svg"} alt={sub.name} fill className="object-cover" />
                          </div>
                          <span className="text-sm font-medium line-clamp-1 text-foreground/80">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <h3 className="font-serif text-2xl font-bold mb-6 pb-2 border-b border-border flex items-center justify-between">
                  <span>Ingredients</span><span className="text-sm font-sans font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">{recipe.ingredients.length} items</span>
                </h3>
                <div className="flex flex-col gap-1">
                  {recipe.ingredients.map((ingredient: string, index: number) => (
                    <IngredientItem key={index} text={ingredient} index={index} />
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-8">
              <h3 className="font-serif text-2xl font-bold mb-6 pb-2 border-b border-border">Preparation</h3>
              <div className="space-y-10">
                {recipe.steps.map((step: string, index: number) => (
                  <div key={index} className="group relative pl-4">
                    <div className="absolute -left-4 -top-2 text-6xl font-serif font-bold text-muted-foreground/10 select-none group-hover:text-primary/10 transition-colors">{index + 1}</div>
                    <div className="relative">
                      <h4 className="font-bold text-foreground mb-2 text-sm uppercase tracking-widest text-muted-foreground">Step {index + 1}</h4>
                      <p className="text-lg leading-relaxed text-foreground/90 font-serif">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-12" />
              <div className="flex justify-center"><p className="text-center text-muted-foreground italic font-serif">Enjoy your meal!</p></div>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}