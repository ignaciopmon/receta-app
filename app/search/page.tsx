// app/search/page.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SearchHeader } from "@/components/search-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Loader2, ChevronRight, Users } from "lucide-react"
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
        .ilike("username", `%${query}%`)
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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <SearchHeader />
      
      <main className="flex-1 w-full pb-20">
        {/* --- HERO SECTION --- */}
        <div className="relative w-full bg-muted/30 border-b border-border/40 pt-12 pb-16 mb-8">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center justify-center p-3 bg-background rounded-full shadow-sm mb-6 text-primary">
               <Users className="h-6 w-6" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 tracking-tight text-balance">
              Discover Chefs
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Find other home cooks, explore their public cookbooks, and get inspired by their collections.
            </p>

            {/* Buscador Integrado estilo Cápsula */}
            <form onSubmit={handleSearch} className="mt-10 relative max-w-md mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="search"
                  placeholder="Search by username..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-14 rounded-full border-border/60 bg-background shadow-lg focus-visible:ring-1 focus-visible:ring-primary/20 text-lg transition-all"
                />
                <div className="absolute inset-y-2 right-2">
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading} 
                    className="h-10 w-10 rounded-full shadow-none"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Resultados */}
          <div className="space-y-6">
            {!hasSearched && !isLoading && (
              <div className="text-center py-12 opacity-50">
                 <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Start your search above</p>
              </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && (
              <Empty className="py-12 border-none bg-transparent shadow-none">
                <EmptyMedia variant="icon" className="bg-muted p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle className="text-xl font-serif font-semibold">
                  No chefs found
                </EmptyTitle>
                <EmptyDescription className="max-w-md">
                  No profiles match "{query}". Try a different username.
                </EmptyDescription>
              </Empty>
            )}

            {!isLoading && results.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((profile) => (
                  <Link
                    key={profile.username}
                    href={`/profile/${encodeURIComponent(profile.username)}`}
                    className="block group"
                  >
                    <Card className="flex items-center justify-between p-4 transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 bg-card/50 backdrop-blur-sm border-border/60">
                      <div className="flex items-center gap-4">
                        {/* Avatar Generado con Inicial */}
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">@{profile.username}</h3>
                          <p className="text-xs text-muted-foreground">View Profile</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Card>
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