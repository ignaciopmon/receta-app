// components/recipe-form.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, X, Loader2, CookingPot, Layers, Check } from "lucide-react" 
import { upload } from "@vercel/blob/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface RecipeFormProps {
  recipeId?: string
  initialName?: string
  initialIngredients?: string[]
  initialSteps?: string[]
  initialLink?: string | null
  initialImageUrl?: string | null
  defaultIngredientsCount?: number
  defaultStepsCount?: number
  initialCategory?: string | null
  initialDifficulty?: string | null
  initialIsFavorite?: boolean
  initialRating?: number | null
  initialPrepTime?: number | null
  initialCookTime?: number | null
  initialServings?: number | null
  initialIsComponent?: boolean
}

interface SimpleRecipe {
  id: string
  name: string
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
  initialCategory = "lunch",
  initialDifficulty = "easy",
  initialIsFavorite = false,
  initialRating = 0,
  initialPrepTime = null,
  initialCookTime = null,
  initialServings = null,
  initialIsComponent = false,
}: RecipeFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!recipeId

  const [name, setName] = useState(initialName)
  
  const [ingredients, setIngredients] = useState<string[]>(
    (initialIngredients && initialIngredients.length > 0)
      ? initialIngredients
      : Array(defaultIngredientsCount).fill(""),
  )
  const [steps, setSteps] = useState<string[]>(
    (initialSteps && initialSteps.length > 0)
      ? initialSteps
      : Array(defaultStepsCount).fill(""),
  )

  const [link, setLink] = useState(initialLink || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl)
  
  const [category, setCategory] = useState(initialCategory || "lunch")
  const [difficulty, setDifficulty] = useState(initialDifficulty || "easy")
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [rating, setRating] = useState(initialRating || 0)

  const [prepTime, setPrepTime] = useState(initialPrepTime?.toString() || "")
  const [cookTime, setCookTime] = useState(initialCookTime?.toString() || "")
  const [servings, setServings] = useState(initialServings?.toString() || "")
  
  const [isComponent, setIsComponent] = useState(initialIsComponent)
  const [linkedComponents, setLinkedComponents] = useState<SimpleRecipe[]>([])
  const [availableComponents, setAvailableComponents] = useState<SimpleRecipe[]>([])
  const [isComponentSearchOpen, setIsComponentSearchOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isComponent) {
      if (!["sauce", "glaze", "cream", "filling", "dough", "topping", "seasoning", "other_component"].includes(category)) {
        setCategory("sauce")
      }
    } else {
       if (["sauce", "glaze", "cream", "filling", "dough", "topping", "seasoning", "other_component"].includes(category)) {
        setCategory("lunch")
       }
    }
  }, [isComponent])

  useEffect(() => {
    if (isEditing && recipeId) {
      fetchLinkedComponents()
    }
    fetchAvailableComponents()
  }, [recipeId])

  const fetchLinkedComponents = async () => {
    const { data, error } = await supabase
      .from("recipe_components")
      .select("component_recipe_id, recipes!recipe_components_component_recipe_id_fkey(id, name)")
      .eq("parent_recipe_id", recipeId)
    
    if (!error && data) {
      const mapped = data.map((item: any) => ({
        id: item.recipes.id,
        name: item.recipes.name
      }))
      setLinkedComponents(mapped)
    }
  }

  const fetchAvailableComponents = async () => {
    let query = supabase
      .from("recipes")
      .select("id, name")
      .eq("is_component", true)
      .is("deleted_at", null)
    
    if (recipeId) {
      query = query.neq("id", recipeId)
    }

    const { data } = await query
    if (data) {
      setAvailableComponents(data)
    }
  }

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
  
  const addComponent = (component: SimpleRecipe) => {
    if (!linkedComponents.find(c => c.id === component.id)) {
      setLinkedComponents([...linkedComponents, component])
    }
    setIsComponentSearchOpen(false)
  }

  const removeComponent = (id: string) => {
    setLinkedComponents(linkedComponents.filter(c => c.id !== id))
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
      }
      
      const recipeData = {
        name: name.trim(),
        ingredients: filteredIngredients,
        steps: filteredSteps,
        image_url: imageUrl,
        link: link.trim() || null,
        category,
        difficulty,
        is_favorite: isComponent ? false : isFavorite,
        rating: isComponent ? null : rating,
        prep_time: isComponent ? null : (prepTime ? parseInt(prepTime, 10) : null),
        cook_time: isComponent ? null : (cookTime ? parseInt(cookTime, 10) : null),
        servings: isComponent ? null : (servings ? parseInt(servings, 10) : null),
        is_component: isComponent,
        user_id: user.id,
      }

      let finalRecipeId = recipeId

      if (isEditing) {
        const { user_id, ...updateData } = recipeData
        const { error: updateError } = await supabase
          .from("recipes")
          .update(updateData)
          .eq("id", recipeId)

        if (updateError) throw updateError
      } else {
        const { data: newRecipe, error: insertError } = await supabase
          .from("recipes")
          .insert(recipeData)
          .select("id")
          .single()
          
        if (insertError) throw insertError
        finalRecipeId = newRecipe.id
      }
      
      if (finalRecipeId) {
        if (isEditing) {
          await supabase.from("recipe_components").delete().eq("parent_recipe_id", finalRecipeId)
        }
        
        if (linkedComponents.length > 0) {
          const relations = linkedComponents.map(comp => ({
            parent_recipe_id: finalRecipeId,
            component_recipe_id: comp.id
          }))
          const { error: relationError } = await supabase.from("recipe_components").insert(relations)
          if (relationError) throw relationError
        }
      }

      router.replace("/recipes?t=" + Date.now())
    } catch (err) {
      console.error("Error saving recipe:", err)
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
          
          <div className="flex items-center space-x-2 rounded-md border p-4 transition-colors hover:bg-muted/20">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Sub-recipe / Component
              </p>
              <p className="text-xs text-muted-foreground">
                Enable this if this recipe is a building block (e.g., Glaze, Dough). It won't appear in your main list and won't have ratings or time.
              </p>
            </div>
            <Switch
              id="isComponent"
              checked={isComponent}
              onCheckedChange={setIsComponent}
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

      {!isComponent && (
        <Card>
           <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-serif">Included Sub-recipes</CardTitle>
                <CardDescription>Include sauces, glazes, or sides you've already created.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsComponentSearchOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Component
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {linkedComponents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sub-recipes linked.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {linkedComponents.map(comp => (
                  <Badge key={comp.id} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2">
                    <Layers className="h-3 w-3" />
                    {comp.name}
                    <button type="button" onClick={() => removeComponent(comp.id)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <CommandDialog open={isComponentSearchOpen} onOpenChange={setIsComponentSearchOpen}>
              <Command>
                <CommandInput placeholder="Search your components..." />
                <CommandList>
                  <CommandEmpty>No components found.</CommandEmpty>
                  <CommandGroup heading="Available Components">
                    {availableComponents.map((comp) => {
                      const isSelected = linkedComponents.some(c => c.id === comp.id)
                      return (
                        <CommandItem
                          key={comp.id}
                          onSelect={() => addComponent(comp)}
                          disabled={isSelected}
                        >
                          <Layers className="mr-2 h-4 w-4" />
                          <span>{comp.name}</span>
                          {isSelected && <Check className="ml-auto h-4 w-4" />}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </CommandDialog>

          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {/* --- INGLÉS ONLY --- */}
                {isComponent ? (
                  <>
                    <SelectItem value="sauce">Sauce</SelectItem>
                    <SelectItem value="glaze">Glaze</SelectItem>
                    <SelectItem value="cream">Cream</SelectItem>
                    <SelectItem value="filling">Filling</SelectItem>
                    <SelectItem value="dough">Dough</SelectItem>
                    <SelectItem value="topping">Topping</SelectItem>
                    <SelectItem value="seasoning">Seasoning</SelectItem>
                    <SelectItem value="other_component">Other Component</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isComponent && (
            <>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (mins)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="e.g., 15"
                    min="0"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cook Time (mins)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    placeholder="e.g., 30"
                    min="0"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  placeholder="e.g., 4"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
                  <SelectTrigger id="rating">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Rating</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3 pt-6">
                 <Switch id="isFavorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
                <Label htmlFor="isFavorite" className="cursor-pointer">
                  Mark as Favorite
                </Label>
              </div>
            </>
          )}

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