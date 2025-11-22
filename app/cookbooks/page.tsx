// app/cookbooks/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipeHeader } from "@/components/recipe-header"
import { CookbookCard } from "@/components/CookbookCard"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { BookOpen } from "lucide-react"
import { CreateCookbookButton } from "@/components/CreateCookbookButton" 

export const dynamic = 'force-dynamic'

export default async function CookbooksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: cookbooks, error } = await supabase
    .from("cookbooks")
    .select("*, cover_color, cover_text, cover_url, cookbook_recipes(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cookbooks:", error)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      
      <main className="flex-1 w-full pb-20">
        {/* Cabecera Centrada */}
        <div className="w-full bg-muted/30 border-b border-border/40 py-12 mb-12">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground tracking-tight">
              Library
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Organize your culinary journey into curated collections. 
              Create cookbooks for holidays, ingredients, or family favorites.
            </p>
            <CreateCookbookButton userId={user.id} />
          </div>
        </div>

        <div className="container mx-auto px-4">
          {(cookbooks?.length || 0) === 0 ? (
            <Empty className="py-16 max-w-lg mx-auto border-none bg-transparent shadow-none">
              <EmptyMedia variant="icon" className="bg-primary/10 text-primary mb-6 p-4 rounded-full">
                <BookOpen className="h-8 w-8" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-serif font-bold mb-2">
                Your shelves are empty
              </EmptyTitle>
              <EmptyDescription className="text-base leading-relaxed mb-6">
                Create your first cookbook to start organizing your recipes.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cookbooks?.map((cookbook) => (
                <CookbookCard
                  key={cookbook.id}
                  id={cookbook.id}
                  name={cookbook.name}
                  description={cookbook.description}
                  cover_color={cookbook.cover_color}
                  cover_text={cookbook.cover_text}
                  cover_url={cookbook.cover_url}
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