import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SaveRecipeButton } from "@/components/save-recipe-button"

// Esta es una cabecera simple para la página pública
function ShareHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-serif font-bold">Cocina</span>
        </Link>
        <Button asChild variant="outline">
          <Link href="/auth/login">
            Login
          </Link>
        </Button>
      </div>
    </header>
  )
}

export default async function ShareRecipePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await createClient()

  // Esta consulta SÓLO funcionará si la RLS del Paso 1 (Política B) se cumple.
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .is("deleted_at", null) // <-- ESTA LÍNEA ES VITAL
    .single()

  // Si hay error, o no hay receta (porque RLS la bloqueó), mostramos un 404
  if (recipeError || !recipe) {
    notFound()
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ShareHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          
          {/* --- Botón de Guardar --- */}
          <div className="mb-6 flex justify-center">
            {/* @ts-ignore */}
            <SaveRecipeButton recipeId={recipe.id} />
          </div>

          <div className="space-y-6">
            {recipe.image_url && (
              <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
                <Image src={recipe.image_url || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-balance">{recipe.name}</h1>
              <div className="flex gap-2 flex-shrink-0">
                {recipe.link && (
                  <Button asChild variant="outline">
                    <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original Source
                    </a>
                  </Button>
                )}
              </div>
            </div>

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
    </div>
  )
}