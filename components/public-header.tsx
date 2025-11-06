// components/public-header.tsx

"use client"

import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Search, Home } from "lucide-react"
import Link from "next/link"

export function PublicHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-serif font-bold">Cocina</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild size="sm">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}