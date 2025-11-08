// app/profile/recipe/[id]/page.tsx

import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Profile {
  username: string
}

interface Recipe {
  id: string
  user_id: string
  name: string
  ingredients: string[]
  steps: string[]
  image_url: string | null
  link: string | null
  category: string | null
  difficulty: string | null
}

export default async function PublicRecipePage({
  params,
}: {
  // --- CAMBIO AQUÍ ---
  params: Promise<{ id: string }>
  // --- FIN DEL CAMBIO ---
}) {
  // --- CAMBIO AQUÍ ---
  // Esperamos (await) a que se resuelvan los params
  const { id } = await params
  // --- FIN DEL CAMBIO ---
  const supabase = await createClient()

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id, name, ingredients, steps, image_url, link, category, difficulty")
    .eq("id", id)
    .eq("is_public", true)
    .is("deleted_at", null)
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", recipe.user_id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href={`/profile/${encodeURIComponent(profile.username)}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to @{profile.username}'s profile
            </Link>
          </Button>

          <div className="space-y-6">
            {recipe.image_url && (
              <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
                <Image src={recipe.image_url || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-balance">{recipe.name}</h1>
              
              <div className="flex gap-3 flex-shrink-0">
                {recipe.link && (
                  <>
                    <Button asChild variant="outline" size="icon" className="md:hidden">
                      <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="hidden md:inline-flex">
                      <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Source
                      </a>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-sm">
                <User className="h-4 w-4" />
                <span>Recipe by <Link href={`/profile/${encodeURIComponent(profile.username)}`} className="font-medium text-foreground hover:underline">@{profile.username}</Link></span>
              </div>
              {recipe.category && <Badge variant="outline">{recipe.category}</Badge>}
              {recipe.difficulty && <Badge variant="secondary">{recipe.difficulty}</Badge>}
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