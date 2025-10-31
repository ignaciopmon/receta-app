import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch the specific recipe
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .is("deleted_at", null) // <-- ¡AQUÍ ESTÁ LA CORRECCIÓN!
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/recipes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>

          <div className="space-y-6">
            {recipe.image_url && (
              <div className="relative h-96 w-full overflow-hidden rounded-lg">
                <Image src={recipe.image_url || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-serif font-bold text-balance">{recipe.name}</h1>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/recipes/edit/${id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                {recipe.link && (
                  <Button asChild variant="outline">
                    <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Source
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