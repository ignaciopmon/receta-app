// app/profile/[username]/page.tsx

// COMENTAMOS el notFound por ahora
// import { notFound } from "next/navigation" 
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { PublicRecipeCard } from "@/components/public-recipe-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { User, NotebookPen, AlertTriangle } from "lucide-react" // Importar Alerta

export const dynamic = 'force-dynamic'

// Definición del tipo de Receta
interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
  image_url: string | null;
  link: string | null;
  category: string | null;
  difficulty: string | null;
  is_favorite: boolean;
  rating: number | null;
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createClient()
  const { username } = params
  
  let profile = null;
  let profileError = null;
  
  // --- AÑADIMOS UN BLOQUE try...catch ---
  try {
    // 1. Buscar el perfil por el nombre de usuario (ignorando mayúsculas)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", username)
      .single()

    if (error) throw error; // Lanzamos el error si Supabase lo devuelve
    if (!data) throw new Error("Profile not found in database."); // Lanzamos un error si no hay datos

    profile = data;

  } catch (error: any) {
    profileError = error;
  }
  // --- FIN DEL BLOQUE try...catch ---


  // Si hay un error de perfil O no se encontró, mostramos el error
  if (profileError || !profile) {
    // ESTA ES LA PÁGINA DE ERROR TEMPORAL
    return (
      <div className="flex min-h-screen w-full flex-col">
        <PublicHeader />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Empty className="py-16 border-destructive bg-destructive/5">
                <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-12 w-12" />
                </EmptyMedia>
                <EmptyTitle className="text-2xl font-serif font-semibold text-destructive">
                  Error al cargar el perfil
                </EmptyTitle>
                <EmptyDescription>
                  <p>No pudimos encontrar el perfil para: <strong>@{username}</strong></p>
                  <p className="mt-4">Detalles del error:</p>
                  <code className="block bg-black/10 p-2 rounded-md text-left text-xs mt-2">
                    {/* Imprimimos el error aquí */}
                    {profileError ? profileError.message : "No profile data returned."}
                  </code>
                </EmptyDescription>
              </Empty>
          </div>
        </main>
      </div>
    )
    // ------------------------------------
  }

  // --- El resto del código solo se ejecuta si el perfil SE ENCONTRÓ ---

  // 2. Buscar las recetas PÚBLICAS de ese perfil
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", profile.id)     // Del usuario encontrado
    .eq("is_public", true)        // Que sean públicas
    .is("deleted_at", null)       // Que no estén borradas
    .order("created_at", { ascending: false })

  if (recipesError) {
    // Aquí sí podemos usar un notFound o un error
    return <div>Error al cargar recetas: {recipesError.message}</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-10 w-10 text-muted-foreground" />
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-balance">@{profile.username}</h1>
                <p className="text-muted-foreground text-lg">
                  Public recipe collection
                </p>
              </div>
            </div>
          </div>

          {recipes.length > 0 ? (
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
          ) : (
            <div className="max-w-4xl mx-auto">
              <Empty className="py-16">
                <EmptyMedia variant="icon"><NotebookPen className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle className="text-2xl font-serif font-semibold">
                  No public recipes yet
                </EmptyTitle>
                <EmptyDescription>
                  @{profile.username} hasn't published any recipes yet. Check back later!
                </EmptyDescription>
              </Empty>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}