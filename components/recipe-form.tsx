"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Loader2, CookingPot } from "lucide-react"
import { upload } from "@vercel/blob/client"

interface RecipeFormProps {
  recipeId?: string
  initialName?: string
  initialIngredients?: string[]
  initialSteps?: string[]
  initialLink?: string | null
  initialImageUrl?: string | null
  defaultIngredientsCount?: number
  defaultStepsCount?: number
}

export function RecipeForm({
  recipeId,
  initialName = "",
  initialIngredients,
  initialSteps,
  initialLink = "",
  initialImageUrl = null,
  defaultIngredientsCount = 3,
  defaultStepsCount = 3,
}: RecipeFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!recipeId

  const [name, setName] = useState(initialName)
  const [ingredients, setIngredients] = useState<string[]>(
    initialIngredients || Array(defaultIngredientsCount).fill(""),
  )
  const [steps, setSteps] = useState<string[]>(initialSteps || Array(defaultStepsCount).fill(""))
  const [link, setLink] = useState(initialLink || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addIngredient = () => {
    setIngredients([...ingredients, ""])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  const addStep = () => {
    setSteps([...steps, ""])
  }

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = value
    setSteps(newSteps)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const filteredIngredients = ingredients.filter((i) => i.trim() !== "")
      const filteredSteps = steps.filter((s) => s.trim() !== "")

      if (!name.trim()) {
        throw new Error("Recipe name is required")
      }
      if (filteredIngredients.length === 0) {
        throw new Error("At least one ingredient is required")
      }
      if (filteredSteps.length === 0) {
        throw new Error("At least one step is required")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      console.log("[v0] Current user ID:", user.id)
      console.log("[v0] Submitting recipe:", { name, filteredIngredients, filteredSteps })

      let imageUrl: string | null = initialImageUrl
      if (imageFile) {
        const blob = await upload(imageFile.name, imageFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
          options: {
            addRandomSuffix: true,
          },
        })
        imageUrl = blob.url
        console.log("[v0] Image uploaded:", imageUrl)
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("recipes")
          .update({
            name: name.trim(),
            ingredients: filteredIngredients,
            steps: filteredSteps,
            image_url: imageUrl,
            link: link.trim() || null,
          })
          .eq("id", recipeId)

        if (updateError) throw updateError
        console.log("[v0] Recipe updated successfully")
      } else {
        const { error: insertError } = await supabase.from("recipes").insert({
          user_id: user.id,
          name: name.trim(),
          ingredients: filteredIngredients,
          steps: filteredSteps,
          image_url: imageUrl,
          link: link.trim() || null,
        })

        if (insertError) {
          console.error("[v0] Insert error:", insertError)
          throw insertError
        }
        console.log("[v0] Recipe created successfully with user_id:", user.id)
      }

      router.replace("/recipes?t=" + Date.now())
    } catch (err) {
      console.error("[v0] Error saving recipe:", err)
      setError(err instanceof Error ? err.message : "Failed to save recipe")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Recipe Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Chocolate Chip Cookies"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Recipe Link (optional)</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/recipe"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Recipe Image (optional)</Label>
            <div className="flex items-center gap-4">
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
              {imagePreview && (
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif">Ingredients *</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                />
              </div>
              {ingredients.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif">Instructions *</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder={`Step ${index + 1}`}
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  rows={2}
                />
              </div>
              {steps.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating Recipe..." : "Saving Recipe..."}
            </>
          ) : (
            <>
              <CookingPot className="mr-2 h-4 w-4" />
              {isEditing ? "Update Recipe" : "Save Recipe"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
