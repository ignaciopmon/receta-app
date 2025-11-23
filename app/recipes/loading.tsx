// app/recipes/loading.tsx

import { RecipeHeader } from "@/components/recipe-header"
import { RecipeCardSkeleton } from "@/components/recipe-card-skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <RecipeHeader />
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4 max-w-7xl">
          {/* Skeleton del Hero */}
          <div className="mb-12 text-center space-y-6 flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="h-12 w-64 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 w-96 max-w-full bg-muted/50 rounded-full animate-pulse" />
          </div>

          {/* Skeleton del Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}