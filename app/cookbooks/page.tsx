// app/cookbooks/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { CookbookCard } from "@/components/CookbookCard"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { BookPlus, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function CookbooksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // 1. Obtener todos los cookbooks del usuario
  // --- QUERY ACTUALIZADA (para incluir cover_color y cover_text) ---
  const { data: cookbooks, error } = await supabase
    .from("cookbooks")
    .select("*, cover_color, cover_text, cookbook_recipes(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cookbooks:", error)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <RecipeHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">
                My Cookbooks
              </h1>
              <p className="text-muted-foreground text-lg">
                Your personal collections of recipes
              </p>
            </div>
            {/* TODO: Link to a new page /cookbooks/new */}
            <Button size="lg" disabled> 
              <BookPlus className="mr-2 h-5 w-5" />
              New Cookbook
            </Button>
          </div>

          {(cookbooks?.length || 0) === 0 ? (
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <BookOpen className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-semibold">
                Your library is empty
              </EmptyTitle>
              <EmptyDescription className="max-w-md">
                Create a new cookbook, or start saving recipes from your main page
                to see them organized here.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {cookbooks?.map((cookbook) => (
                <CookbookCard
                  key={cookbook.id}
                  id={cookbook.id}
                  name={cookbook.name}
                  description={cookbook.description}
                  // --- PASAR LOS NUEVOS PROPS ---
                  cover_color={cookbook.cover_color}
                  cover_text={cookbook.cover_text}
                  recipeCount={cookbook.cookbook_recipes[0]?.count || 0}
                  isPublic={cookbook.is_public}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}