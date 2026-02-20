// components/recipes-client.tsx

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeSearch } from "@/components/recipe-search"
import { RecipeFilters } from "@/components/recipe-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CookingPot, Search, NotebookPen, ChefHat, SlidersHorizontal, ChevronDown } from "lucide-react"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { WelcomeModal } from "@/components/welcome-modal"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface Recipe {
  id: string; name: string; ingredients: string[]; steps: string[];
  image_url: string | null; link: string | null; category: string | null;
  difficulty: string | null; prep_time: number | null; cook_time: number | null;
  servings: number | null; is_favorite: boolean; tags: string[] | null;
  rating: number | null; is_component: boolean; is_public: boolean;
}

interface RecipesClientProps {
  initialRecipes: Recipe[]
  userId: string
  showWelcome: boolean
  welcomeUsername: string
}

export function RecipesClient({ initialRecipes, userId, showWelcome, welcomeUsername }: RecipesClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // 1. Estado sincronizado con el Servidor
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(initialRecipes)

  // Magia: Si borramos una receta, el servidor nos manda los nuevos datos y se actualiza solo
  useEffect(() => {
    setRecipes(initialRecipes)
  }, [initialRecipes])

  // 2. Filtros desde la URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all")
  const [showFavorites, setShowFavorites] = useState(searchParams.get("favorites") === "true")
  const [showComponents, setShowComponents] = useState(searchParams.get("components") === "true")
  const [rating, setRating] = useState(searchParams.get("rating") || "all")

  const hasActiveFilters = searchParams.get("category") || searchParams.get("difficulty") || searchParams.get("favorites") || searchParams.get("components") || searchParams.get("rating")
  const [isFiltersOpen, setIsFiltersOpen] = useState(!!hasActiveFilters)
  const [showWelcomeModal, setShowWelcomeModal] = useState(showWelcome)

  // 3. Sincronizar URL para no perder los filtros al dar "Atrás"
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category !== "all") params.set("category", category)
    if (difficulty !== "all") params.set("difficulty", difficulty)
    if (showFavorites) params.set("favorites", "true")
    if (showComponents) params.set("components", "true")
    if (rating !== "all") params.set("rating", rating)

    const searchString = params.toString()
    if (searchString !== searchParams.toString()) {
      router.replace(pathname + (searchString ? `?${searchString}` : ""), { scroll: false })
    }
  }, [searchQuery, category, difficulty, showFavorites, showComponents, rating, pathname, router, searchParams])

  // Refrescar los datos del servidor automáticamente si vuelves a la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") router.refresh()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [router])

  // 4. Lógica de Filtrado Local (Instantáneo)
  useEffect(() => {
    let filtered = [...recipes]
    if (!showComponents) filtered = filtered.filter(r => r.is_component === false)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing) => ing.toLowerCase().includes(query)) ||
          recipe.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }
    if (category !== "all") filtered = filtered.filter((recipe) => recipe.category === category)
    if (difficulty !== "all") filtered = filtered.filter((recipe) => recipe.difficulty === difficulty)
    if (showFavorites) filtered = filtered.filter((recipe) => recipe.is_favorite)
    if (rating !== "all") {
      const minRating = Number(rating)
      if (minRating === 0) {
        filtered = filtered.filter((recipe) => recipe.rating === 0 || recipe.rating === null)
      } else {
        filtered = filtered.filter((recipe) => recipe.rating !== null && recipe.rating >= minRating)
      }
    }
    setFilteredRecipes(filtered)
  }, [recipes, searchQuery, category, difficulty, showFavorites, showComponents, rating])

  const realRecipeCount = recipes.filter(r => !r.is_component).length

  return (
    <main className="flex-1 w-full pb-20">
      <div className="relative w-full bg-muted/30 border-b border-border/40 pt-12 pb-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-background rounded-full shadow-sm mb-6">
             <ChefHat className="h-5 w-5 text-primary mr-2" />
             <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">My Kitchen</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 tracking-tight text-balance">
            Your <span className="group relative inline-block cursor-pointer transition-transform duration-300 ease-out hover:-rotate-3 hover:scale-105"><span className="relative z-10">Cocina</span><span className="absolute inset-0 -z-10 block rounded-sm bg-yellow-300/60 dark:bg-yellow-500/50 -skew-y-3 scale-x-0 transition-transform duration-500 ease-out origin-left group-hover:scale-x-110 group-hover:rotate-2"></span></span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {realRecipeCount > 0 ? `You have created ${realRecipeCount} ${realRecipeCount === 1 ? "recipe" : "recipes"} in your personal kitchen.` : "Start your culinary journey by adding your first recipe."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {recipes.length > 0 && (
          <div className="sticky top-20 z-30 mb-10">
            <div className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-2xl transition-all overflow-hidden">
              <div className="flex items-center gap-3 p-2 pl-3">
                <div className="flex-1"><RecipeSearch value={searchQuery} onChange={setSearchQuery} /></div>
                <Button variant="ghost" size="sm" onClick={() => setIsFiltersOpen(!isFiltersOpen)} className={cn("gap-2 rounded-full px-4 h-11 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all shrink-0 border border-transparent", isFiltersOpen && "bg-muted/50 text-foreground border-border/40")}>
                  <SlidersHorizontal className="h-4 w-4" /><span className="hidden sm:inline">Filters</span><ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isFiltersOpen && "rotate-180")} />
                </Button>
              </div>
              <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="px-4 pb-4 pt-0">
                    <div className="h-px w-full bg-border/40 mb-4" />
                    <RecipeFilters category={category} onCategoryChange={setCategory} difficulty={difficulty} onDifficultyChange={setDifficulty} showFavorites={showFavorites} onToggleFavorites={() => setShowFavorites(!showFavorites)} showComponents={showComponents} onToggleComponents={() => setShowComponents(!showComponents)} rating={rating} onRatingChange={setRating} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}

        {recipes.length === 0 ? (
          <Empty className="py-16 border-none bg-transparent shadow-none">
            <EmptyMedia variant="icon" className="bg-primary/10 text-primary mb-6 p-6 rounded-full"><CookingPot className="h-10 w-10" /></EmptyMedia>
            <EmptyTitle className="text-2xl font-serif font-bold mb-2">Your kitchen is quiet</EmptyTitle>
            <EmptyDescription className="max-w-md text-base">Create your first recipe to bring this page to life.</EmptyDescription>
            <Button asChild size="lg" className="mt-8 rounded-full shadow-lg hover:shadow-xl transition-all"><Link href="/recipes/new"><NotebookPen className="mr-2 h-5 w-5" />Create First Recipe</Link></Button>
          </Empty>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                name={recipe.name}
                ingredients={recipe.ingredients}
                steps={recipe.steps}
                imageUrl={recipe.image_url}
                link={recipe.link}
                onUpdate={() => router.refresh()} // Ahora actualizar pide datos frescos al servidor
                category={recipe.category}
                difficulty={recipe.difficulty}
                isFavorite={recipe.is_favorite}
                rating={recipe.rating}
                tags={recipe.tags}
              />
            ))}
          </div>
        ) : (
          <Empty className="py-16 border-none bg-transparent shadow-none">
            <EmptyMedia variant="icon" className="bg-muted p-4 rounded-full mb-4"><Search className="h-8 w-8 text-muted-foreground" /></EmptyMedia>
            <EmptyTitle className="text-xl font-serif font-semibold">No matches found</EmptyTitle>
            <EmptyDescription className="max-w-md">Try adjusting your filters or search terms.</EmptyDescription>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="outline" className="rounded-full border-dashed" onClick={() => { setSearchQuery(""); setCategory("all"); setDifficulty("all"); setShowFavorites(false); setRating("all"); }}>Clear Filters</Button>
              {!showComponents && (
                 <Button variant="ghost" className="rounded-full text-primary hover:bg-primary/10" onClick={() => { setShowComponents(true); setIsFiltersOpen(true); }}>Try searching components</Button>
              )}
            </div>
          </Empty>
        )}
      </div>
      
      {showWelcomeModal && <WelcomeModal userId={userId} username={welcomeUsername} onClose={() => setShowWelcomeModal(false)} />}
    </main>
  )
}