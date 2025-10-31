"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RecipeCardProps {
  id: string
  name: string
  ingredients: string[]
  steps: string[]
  imageUrl?: string | null
  link?: string | null
}

export function RecipeCard({ id, name, ingredients, steps, imageUrl, link }: RecipeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("recipes").update({ deleted_at: new Date().toISOString() }).eq("id", id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting recipe:", error)
      alert("Failed to delete recipe")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
      )}
      <CardHeader>
        <h3 className="text-xl font-serif font-semibold leading-tight text-balance">{name}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Ingredients ({ingredients.length})</p>
          <p className="text-sm line-clamp-2">
            {ingredients.slice(0, 3).join(", ")}
            {ingredients.length > 3 && "..."}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Steps ({steps.length})</p>
          <p className="text-sm line-clamp-2">{steps[0]}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="flex-1 bg-transparent">
          <Link href={`/recipes/${id}`}>View Details</Link>
        </Button>
        <Button asChild variant="outline" size="icon">
          <Link href={`/recipes/edit/${id}`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        {link && (
          <Button asChild variant="outline" size="icon">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
