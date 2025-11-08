// app/search/page.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SearchHeader } from "@/components/search-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, User, ChevronsRight } from "lucide-react"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

interface ProfileResult {
  username: string
}

export default function SearchPage() {
  const supabase = createClient()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProfileResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .ilike("username", `%${query}%`) // 'ilike' no distingue mayúsculas/minúsculas
        .limit(20)

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error("Error searching profiles:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SearchHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-balance">Search Profiles</h1>
            <p className="text-muted-foreground text-lg">Find public recipes from other users.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <Input
              type="search"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>

          {/* Resultados de Búsqueda */}
          <div className="space-y-3">
            {!hasSearched && !isLoading && (
              <Empty className="py-16">
                <EmptyMedia variant="icon"><Search className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle>Search for a user</EmptyTitle>
                <EmptyDescription>Enter a username to find public recipe collections.</EmptyDescription>
              </Empty>
            )}
            
            {isLoading && (
              <div className="flex justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && (
              <Empty className="py-16">
                <EmptyMedia variant="icon"><User className="h-12 w-12" /></EmptyMedia>
                <EmptyTitle>No users found</EmptyTitle>
                <EmptyDescription>No profiles match your search for "{query}". Try a different name.</EmptyDescription>
              </Empty>
            )}

{!isLoading && results.length > 0 && (
              <div className="divide-y rounded-lg border bg-card">
                {results.map((profile) => (
                  <Link
                    key={profile.username}
                    // --- CAMBIO AQUÍ ---
                    // Codificamos el username para que caracteres como '@' no rompan la URL
                    href={`/profile/${encodeURIComponent(profile.username)}`}
                    // --- FIN DEL CAMBIO ---
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-medium">@{profile.username}</span>
                    </div>
                    <ChevronsRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}