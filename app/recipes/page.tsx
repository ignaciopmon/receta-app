// app/recipes/page.tsx

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
import { RecipeCardSkeleton } from "@/components/recipe-card-skeleton"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { WelcomeModal } from "@/components/welcome-modal"

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
  is_component: boolean
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

  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [welcomeUsername, setWelcomeUsername] = useState("")
  const [welcomeUserId, setWelcomeUserId] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchData()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Page visible, refetching data")
        fetchData()
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

  const fetchData = async () => {
    setIsLoading(true) 
    try {
      setError(null)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        setRecipes([])
        setIsLoading(false)
        return
      }
      
      checkWelcomeModal(user.id)

      // --- VERSIÓN SEGURA ---
      // Hemos quitado el filtro .eq("is_component", false) para asegurar que carga todo
      // sin importar el estado de esa columna.
      const { data, error: fetchError } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Supabase error:", fetchError)
        throw fetchError
      }

      setRecipes(data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch recipes")
    } finally {
      setTimeout(() => setIsLoading(false), 300)
    }
  }

  const checkWelcomeModal = async (userId: string) => {
    try {
      const { data: prefsData, error: prefsError } = await supabase
        .from("user_preferences")
        .select("has_seen_welcome_modal")
        .eq("user_id", userId)
        .single()

      if (prefsError && prefsError.code !== 'PGRST116') {
         console.log("Pref error ignore", prefsError)
      }
      
      if (prefsData && !prefsData.has_seen_welcome_modal) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .single()
        
        if (profileData) {
          setWelcomeUsername(profileData.username)
          setWelcomeUserId(userId)
          setShowWelcomeModal(true)
        }
      }
    } catch (welcomeError) {
      console.error("Error checking for welcome modal:", welcomeError)
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <RecipeHeader />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">Cocina</h1>
              <p className="text-muted-foreground text-lg">Loading your recipes...</p>
            </div>
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

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <RecipeHeader />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center p-4">
            <h2 className="text-xl font-serif font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => fetchData()} className="mt-4">
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
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <CookingPot className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-semibold">
                No recipes yet
              </EmptyTitle>
              <EmptyDescription className="max-w-md">
                Start your culinary journey by adding your first recipe.
              </EmptyDescription>
              <Button asChild size="lg" className="mt-4">
                <Link href="/recipes/new">
                  <NotebookPen className="mr-2 h-5 w-5" />
                  Add Your First Recipe
                </Link>
              </Button>
            </Empty>

          ) : filteredRecipes.length > 0 ? (
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
                  onUpdate={fetchData}
                  category={recipe.category}
                  difficulty={recipe.difficulty}
                  isFavorite={recipe.is_favorite}
                  rating={recipe.rating}
                />
              ))}
            </div>

          ) : (
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <Search className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-semibold">
                No recipes found
              </EmptyTitle>
              <EmptyDescription className="max-w-md">
                Try adjusting your search or filters.
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
      {showWelcomeModal && (
        <WelcomeModal
          userId={welcomeUserId}
          username={welcomeUsername}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}
    </div>
  )
}