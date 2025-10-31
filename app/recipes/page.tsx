"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RecipeHeader } from "@/components/recipe-header"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeSearch } from "@/components/recipe-search"
import { RecipeFilters } from "@/components/recipe-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CookingPot, Search } from "lucide-react"

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
  rating: number | null // <-- AÑADIR RATING
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [showFavorites, setShowFavorites] = useState(false)
  const [rating, setRating] = useState("all") // <-- NUEVO ESTADO
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
  }, [recipes, searchQuery, category, difficulty, showFavorites, rating]) // <-- AÑADIR RATING

  const fetchRecipes = async () => {
    // Nota: 'setIsLoading(true)' se mueve aquí para que se muestre el spinner
    // en cada recarga, incluyendo borrados y favoritos.
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
        .select("*") // 'rating' se incluye con '*' gracias al script SQL
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
      setIsLoading(false)
    }
  }

  const filterRecipes = () => {
    let filtered = [...recipes]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing) => ing.toLowerCase().includes(query)) ||
          recipe.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter((recipe) => recipe.category === category)
    }

    // Difficulty filter
    if (difficulty !== "all") {
      filtered = filtered.filter((recipe) => recipe.difficulty === difficulty)
    }

    // Favorites filter
    if (showFavorites) {
      filtered = filtered.filter((recipe) => recipe.is_favorite)
    }

    // --- NUEVO FILTRO DE RATING ---
    if (rating !== "all") {
      const minRating = Number(rating)
      if (minRating === 0) {
        // "Unrated"
        filtered = filtered.filter((recipe) => recipe.rating === 0 || recipe.rating === null)
      } else {
        // "X+ Stars"
        filtered = filtered.filter((recipe) => recipe.rating !== null && recipe.rating >= minRating)
      }
    }
    // ----------------------------

    setFilteredRecipes(filtered)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <RecipeHeader />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <CookingPot className="h-8 w-8 animate-pulse text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <RecipeHeader />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
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
            <h1 className="text-4xl font-serif font-bold mb-2 text-balance">Cocina</h1>
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
                rating={rating} // <-- PASAR PROP
                onRatingChange={setRating} // <-- PASAR PROP
              />
            </div>
          )}

          {filteredRecipes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  // --- PASAR NUEVAS PROPS ---
                  category={recipe.category}
                  difficulty={recipe.difficulty}
                  isFavorite={recipe.is_favorite}
                  rating={recipe.rating}
                  // --------------------------
                />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-2">No recipes found</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setCategory("all")
                  setDifficulty("all")
                  setShowFavorites(false)
                  setRating("all") // <-- RESETEAR RATING
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <CookingPot className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-2">No recipes yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start your culinary journey by adding your first recipe. Share your favorite dishes and keep them
                organized in one place.
              </p>
              <Button asChild size="lg">
                <Link href="/recipes/new">
                  <CookingPot className="mr-2 h-5 w-5" />
                  Add Your First Recipe
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}