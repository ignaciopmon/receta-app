"use client"

import { Button } from "@/components/ui/button"
import { UtensilsCrossed, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function SettingsHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/recipes" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-serif font-bold">Cocina</span>
        </Link>
        <Button variant="outline" asChild>
          <Link href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Main Menu
          </Link>
        </Button>
      </div>
    </header>
  )
}
