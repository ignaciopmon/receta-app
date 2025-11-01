"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RecipeHeader } from "@/components/recipe-header"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeSearch } from "@/components/recipe-search"
import { RecipeFilters } from "@/components/recipe-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CookingPot, Search, NotebookPen } from "lucide-react"

// --- IMPORTS ACTUALIZADOS ---
import { RecipeCardSkeleton } from "@/components/recipe-card-skeleton"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
// ----------------------------

interface Recipe {
  id: string
  name: string
  ingredients: string[]
  steps: string[]
  image_url: string | null
  link: string | null
  category: string | null
  difficulty: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  is_favorite: boolean
  tags: string[] | null
  rating: number | null
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [showFavorites, setShowFavorites] = useState(false)
  const [rating, setRating] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchRecipes()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[v0] Page visible, refetching recipes")
        fetchRecipes()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    filterRecipes()
  }, [recipes, searchQuery, category, difficulty, showFavorites, rating])

  const fetchRecipes = async () => {
    setIsLoading(true) 
    try {
      setError(null)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("[v0] User auth error:", userError)
        throw userError
      }

      if (!user) {
        console.warn("[v0] No user found")
        setRecipes([])
        setIsLoading(false)
        return
      }

      console.log("[v0] Fetching recipes for user:", user.id)

      const { data, error: fetchError } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("[v0] Fetch error:", fetchError)
        throw fetchError
      }

      console.log("[v0] Fetched recipes count:", data?.length || 0)
      if (data) {
        console.log("[v0] First recipe sample:", data[0])
      }
      setRecipes(data || [])
    } catch (error) {
      console.error("[v0] Error fetching recipes:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch recipes")
    } finally {
      // Pequeño retraso para que la animación se aprecie
      setTimeout(() => setIsLoading(false), 300)
    }
  }

  const filterRecipes = () => {
    let filtered = [...recipes]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing) => ing.toLowerCase().includes(query)) ||
          recipe.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (category !== "all") {
      filtered = filtered.filter((recipe) => recipe.category === category)
    }

    if (difficulty !== "all") {
      filtered = filtered.filter((recipe) => recipe.difficulty === difficulty)
    }

    if (showFavorites) {
      filtered = filtered.filter((recipe) => recipe.is_favorite)
    }

    if (rating !== "all") {
      const minRating = Number(rating)
      if (minRating === 0) {
        filtered = filtered.filter((recipe) => recipe.rating === 0 || recipe.rating === null)
      } else {
        filtered = filtered.filter((recipe) => recipe.rating !== null && recipe.rating >= minRating)
      }
    }

    setFilteredRecipes(filtered)
  }

  // --- ESTADO DE CARGA MEJORADO ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <RecipeHeader />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto py-8 px-4">
            {/* Cabecera fantasma */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">Cocina</h1>
              <p className="text-muted-foreground text-lg">Loading your recipes...</p>
            </div>
            {/* Grid de Esqueletos */}
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
            </div>
          </div>
        </main>
      </div>
    )
  }
  // ---------------------------------

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <RecipeHeader />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center p-4">
            <h2 className="text-xl font-serif font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => fetchRecipes()} className="mt-4">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">Cocina</h1>
            <p className="text-muted-foreground text-lg">
              {recipes.length > 0
                ? `You have ${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} saved`
                : "Start building your personal recipe collection"}
            </p>
          </div>

          {recipes.length > 0 && (
            <div className="space-y-6 mb-8">
              <RecipeSearch value={searchQuery} onChange={setSearchQuery} />
              <RecipeFilters
                category={category}
                onCategoryChange={setCategory}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                showFavorites={showFavorites}
                onToggleFavorites={() => setShowFavorites(!showFavorites)}
                rating={rating}
                onRatingChange={setRating}
              />
            </div>
          )}

          {recipes.length === 0 ? (
            // --- ESTADO VACÍO (PRIMER USO) ---
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <CookingPot className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-semibold">
                No recipes yet
              </EmptyTitle>
              <EmptyDescription className="max-w-md">
                Start your culinary journey by adding your first recipe. Share your favorite dishes and keep them
                organized in one place.
              </EmptyDescription>
              <Button asChild size="lg" className="mt-4">
                <Link href="/recipes/new">
                  <NotebookPen className="mr-2 h-5 w-5" />
                  Add Your First Recipe
                </Link>
              </Button>
            </Empty>

          ) : filteredRecipes.length > 0 ? (
            // --- LISTA DE RECETAS ---
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  name={recipe.name}
                  ingredients={recipe.ingredients}
                  steps={recipe.steps}
                  imageUrl={recipe.image_url}
                  link={recipe.link}
                  onUpdate={fetchRecipes}
                  category={recipe.category}
                  difficulty={recipe.difficulty}
                  isFavorite={recipe.is_favorite}
                  rating={recipe.rating}
                />
              ))}
            </div>

          ) : (
            // --- ESTADO VACÍO (SIN RESULTADOS) ---
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <Search className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-semibold">
                No recipes found
              </EmptyTitle>
              <EmptyDescription className="max-w-md">
                Try adjusting your search or filters to find what you're looking for.
              </EmptyDescription>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setCategory("all")
                  setDifficulty("all")
                  setShowFavorites(false)
                  setRating("all")
                }}
              >
                Clear Filters
              </Button>
            </Empty>
          )}
        </div>
      </main>
    </div>
  )
}