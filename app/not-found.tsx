// app/not-found.tsx

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchX, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 border border-border/50 shadow-sm">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h2 className="mb-3 font-serif text-4xl font-bold tracking-tight text-foreground">
        Recipe Not Found
      </h2>
      
      <p className="mb-8 max-w-md text-lg text-muted-foreground leading-relaxed">
        It seems this page has evaporated like wine in a hot pan. 
        Let's get you back to the kitchen.
      </p>
      
      <div className="flex gap-4">
        <Button asChild variant="outline" size="lg" className="rounded-full border-border/60">
          <Link href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>
      </div>
    </div>
  )
}