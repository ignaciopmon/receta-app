// app/profile/[username]/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { PublicRecipeCard } from "@/components/public-recipe-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { User, NotebookPen } from "lucide-react"

// Esta línea es MUY IMPORTANTE, evita que Vercel guarde el error en caché.
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

  
  // 1. Buscamos el perfil
  // --- CORRECCIÓN AQUÍ ---
  // Cambiamos .ilike("username", username).limit(1) por .eq("username", username).single()
  // .eq() busca una coincidencia exacta (vital para nombres de usuario con '_', etc.)
  // .single() devuelve un objeto (o null), no un array, lo que simplifica la comprobación.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username) // Busca la coincidencia exacta
    .single() 


  // // 2. Comprobamos si la consulta falló O si no devolvió ningún perfil
  // if (profileError || !profile) {
  //   notFound()
  // }

  // // 3. Si todo va bien, 'profile' ya es el objeto correcto (no un array)
  
  // // // 4. Buscar las recetas PÚBLICAS de ese perfil
  // const { data: recipes, error: recipesError } = await supabase
  //   .from("recipes")
  //   .select("*")
  //   .eq("user_id", profile.id)     // Del usuario encontrado
  //   .eq("is_public", true)        // Que sean públicas
  //   .is("deleted_at", null)       // Que no estén borradas
  //   .order("created_at", { ascending: false })

  return <div>
    {
      JSON.stringify({profile, profileError})  
    } 
    //////////////
    {JSON.stringify({username})}
  
  </div> 

  // if (recipesError) {
  //   console.error("Error fetching recipes:", recipesError)
  //   notFound()
  // }

  // return (
  //   <div className="flex min-h-screen w-full flex-col">
  //     <PublicHeader />
  //     <main className="flex-1 bg-muted/30">
  //       <div className="container mx-auto py-8 px-4">
  //         <div className="mb-8 max-w-4xl mx-auto">
  //           <div className="flex items-center gap-3 mb-2">
  //             <User className="h-10 w-10 text-muted-foreground" />
  //             <div>
  //               <h1 className="text-3xl md:text-4xl font-serif font-bold text-balance">@{profile.username}</h1>
  //               <p className="text-muted-foreground text-lg">
  //                 Public recipe collection
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         {recipes.length > 0 ? (
  //           <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
  //             {recipes.map((recipe) => (
  //               <PublicRecipeCard
  //                 key={recipe.id}
  //                 id={recipe.id}
  //                 name={recipe.name}
  //                 ingredients={recipe.ingredients}
  //                 steps={recipe.steps}
  //                 imageUrl={recipe.image_url}
  //                 link={recipe.link}
  //                 category={recipe.category}
  //                 difficulty={recipe.difficulty}
  //                 isFavorite={recipe.is_favorite}
  //                 rating={recipe.rating}
  //               />
  //             ))}
  //           </div>
  //         ) : (
  //           <div className="max-w-4xl mx-auto">
  //             <Empty className="py-16">
  //               <EmptyMedia variant="icon"><NotebookPen className="h-12 w-12" /></EmptyMedia>
  //               <EmptyTitle className="text-2xl font-serif font-semibold">
  //                 No public recipes yet
  //               </EmptyTitle> 
  //               {/* --- ¡AQUÍ ESTABA EL ERROR! --- */}
  //               {/* El error que reportaste (</Title>) ya está corregido. 
  //                 La línea de arriba (<EmptyTitle>) se cierra correctamente.
  //               */}
  //               <EmptyDescription>
  //                 @{profile.username} hasn't published any recipes yet. Check back later!
  //               </EmptyDescription>
  //             </Empty>
  //           </div>
  //         )}
  //       </div>
  //     </main>
  //   </div>
  // )
}
