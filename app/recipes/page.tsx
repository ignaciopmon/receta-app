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
import { CookingPot, Search, NotebookPen, ChefHat, Filter } from "lucide-react"
import { RecipeCardSkeleton } from "@/components/recipe-card-skeleton"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { WelcomeModal } from "@/components/welcome-modal"
import { cn } from "@/lib/utils"

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
  is_public: boolean
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [showFavorites, setShowFavorites] = useState(false)
  const [showComponents, setShowComponents] = useState(false) // Nuevo estado para sub-recetas
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
  }, [recipes, searchQuery, category, difficulty, showFavorites, showComponents, rating])

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

      // --- CAMBIO: Traemos TODO (incluido is_component = true) y filtramos en cliente ---
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
      const { data: prefsData } = await supabase
        .from("user_preferences")
        .select("has_seen_welcome_modal")
        .eq("user_id", userId)
        .single()
      
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

    // 1. Filtro de Componentes (Lógica principal)
    // Si showComponents es FALSE -> Ocultar componentes (mostrar solo recetas normales)
    // Si showComponents es TRUE -> Mostrar SOLO componentes (o ambos, según preferencia)
    // *Decisión UX*: Generalmente es mejor alternar. O ves recetas, o ves componentes.
    // Pero para flexibilidad, haremos: 
    // - OFF: Solo Recetas
    // - ON: Recetas + Componentes (así puedes buscar "Salsa" y verla)
    if (!showComponents) {
      filtered = filtered.filter(r => r.is_component === false)
    }
    // Si está ON, no filtramos por is_component, dejamos pasar todo.

    // 2. Búsqueda de Texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing) => ing.toLowerCase().includes(query)) ||
          recipe.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // 3. Categoría
    if (category !== "all") {
      filtered = filtered.filter((recipe) => recipe.category === category)
    }

    // 4. Dificultad
    if (difficulty !== "all") {
      filtered = filtered.filter((recipe) => recipe.difficulty === difficulty)
    }

    // 5. Favoritos
    if (showFavorites) {
      filtered = filtered.filter((recipe) => recipe.is_favorite)
    }

    // 6. Valoración
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
      <div className="flex min-h-screen w-full flex-col bg-background">
        <RecipeHeader />
        <main className="flex-1">
          <div className="container mx-auto py-12 px-4 max-w-7xl">
            <div className="mb-12 text-center space-y-4">
              <div className="h-8 w-48 bg-muted rounded-full mx-auto animate-pulse" />
              <div className="h-4 w-64 bg-muted/50 rounded-full mx-auto animate-pulse" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <RecipeCardSkeleton />
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
      <div className="flex min-h-screen w-full flex-col bg-background">
        <RecipeHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="bg-destructive/10 text-destructive p-4 rounded-full w-fit mx-auto mb-4">
               <CookingPot className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-serif font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => fetchData()} className="rounded-full">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      
      <main className="flex-1 w-full pb-20">
        {/* --- HERO SECTION --- */}
        <div className="relative w-full bg-muted/30 border-b border-border/40 pt-12 pb-12 mb-8">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center p-2 bg-background rounded-full shadow-sm mb-6">
               <ChefHat className="h-5 w-5 text-primary mr-2" />
               <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">My Kitchen</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 tracking-tight text-balance">
              Your Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {recipes.length > 0
                ? `You have curated ${recipes.length} items in your personal cookbook.`
                : "Start your culinary journey by adding your first recipe."}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* --- BARRA DE HERRAMIENTAS COMPRIMIBLE --- */}
          {recipes.length > 0 && (
            <div className="sticky top-20 z-30 mb-10 flex justify-center">
              
              {/* CONTENEDOR GROUP PARA EL HOVER */}
              <div className="group relative w-full max-w-md hover:max-w-5xl transition-[max-width] duration-500 ease-in-out">
                
                {/* Fondo y Borde que cambian de forma */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-full group-hover:rounded-2xl group-hover:shadow-lg transition-all duration-500"></div>

                {/* Contenido */}
                <div className="relative p-2 group-hover:p-4 flex flex-col md:flex-row items-center gap-4 transition-all">
                  
                  {/* Barra de Búsqueda (Siempre visible, se expande en hover) */}
                  <div className="w-full md:flex-1 transition-all">
                    <RecipeSearch value={searchQuery} onChange={setSearchQuery} />
                  </div>

                  {/* Indicador visual de que hay más (solo visible cuando NO hay hover) */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground md:hidden group-hover:hidden animate-pulse">
                    <Filter className="h-4 w-4" />
                  </div>
                  
                  {/* Filtros (Ocultos por defecto, visibles en hover) */}
                  <div className="w-full md:w-auto overflow-hidden max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100 transition-all duration-500 ease-in-out delay-75 flex flex-col md:flex-row gap-4">
                    <div className="w-full h-px bg-border/50 md:hidden" /> {/* Separador móvil */}
                    
                    <RecipeFilters
                      category={category}
                      onCategoryChange={setCategory}
                      difficulty={difficulty}
                      onDifficultyChange={setDifficulty}
                      showFavorites={showFavorites}
                      onToggleFavorites={() => setShowFavorites(!showFavorites)}
                      showComponents={showComponents}
                      onToggleComponents={() => setShowComponents(!showComponents)}
                      rating={rating}
                      onRatingChange={setRating}
                    />
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* --- CONTENIDO GRID --- */}
          {recipes.length === 0 ? (
            <Empty className="py-16 border-none bg-transparent shadow-none">
              <EmptyMedia variant="icon" className="bg-primary/10 text-primary mb-6 p-6 rounded-full">
                <CookingPot className="h-10 w-10" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-bold mb-2">
                Your kitchen is quiet
              </EmptyTitle>
              <EmptyDescription className="max-w-md text-base">
                Create your first recipe to bring this page to life.
              </EmptyDescription>
              <Button asChild size="lg" className="mt-8 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href="/recipes/new">
                  <NotebookPen className="mr-2 h-5 w-5" />
                  Create First Recipe
                </Link>
              </Button>
            </Empty>

          ) : filteredRecipes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <Empty className="py-16 border-none bg-transparent shadow-none">
              <EmptyMedia variant="icon" className="bg-muted p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-xl font-serif font-semibold">
                No matches found
              </EmptyTitle>
              <EmptyDescription className="max-w-md">
                Try adjusting your filters or search terms to find what you're looking for.
                {showComponents ? "" : " (Hidden components are not included in search)"}
              </EmptyDescription>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="rounded-full border-dashed"
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
                {!showComponents && (
                   <Button
                    variant="ghost"
                    className="rounded-full text-primary hover:bg-primary/10"
                    onClick={() => setShowComponents(true)}
                  >
                    Try searching components
                  </Button>
                )}
              </div>
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