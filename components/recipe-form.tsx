// components/recipe-form.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, X, Loader2, CookingPot, Layers, Check, 
  GripVertical, Image as ImageIcon, UploadCloud, 
  Utensils, ListOrdered, Trash2, ArrowUp, ArrowDown 
} from "lucide-react" 
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
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

// --- DND KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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
  initialTags?: string[] | null // NUEVO PROP PARA ETIQUETAS
}

interface SimpleRecipe {
  id: string
  name: string
}

interface FormItem {
  id: string
  value: string
}

const generateId = () => Math.random().toString(36).substr(2, 9)

function SortableRow({ 
  id, 
  value, 
  onChange, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast, 
  placeholder, 
  isTextArea = false,
  index,
  canRemove,
  isMobile
}: {
  id: string; value: string; onChange: (val: string) => void; onRemove: () => void;
  onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean;
  placeholder: string; isTextArea?: boolean; index?: number; canRemove: boolean; isMobile: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as 'relative',
  }

  return (
    <div ref={setNodeRef} style={style} className={cn("flex gap-2 md:gap-4 items-start group relative py-2", isDragging && "opacity-50 bg-muted/30 rounded-md")}>
      <div className="flex flex-col gap-1 mt-1 shrink-0">
        {isMobile ? (
          <div className="flex flex-col gap-2 bg-muted/30 p-1 rounded-md">
            <button type="button" onClick={onMoveUp} disabled={isFirst} className="p-2 rounded-sm hover:bg-background disabled:opacity-20 text-muted-foreground"><ArrowUp className="h-4 w-4" /></button>
            <button type="button" onClick={onMoveDown} disabled={isLast} className="p-2 rounded-sm hover:bg-background disabled:opacity-20 text-muted-foreground"><ArrowDown className="h-4 w-4" /></button>
          </div>
        ) : (
          <button type="button" className={cn("mt-2 cursor-grab active:cursor-grabbing text-muted-foreground/20 hover:text-foreground transition-colors outline-none p-1 opacity-0 group-hover:opacity-100", isTextArea && "mt-4")} {...attributes} {...listeners} title="Drag to reorder"><GripVertical className="h-5 w-5" /></button>
        )}
      </div>

      <div className="flex-1 relative min-w-0">
        {isTextArea ? (
          <div className="flex gap-3 items-start">
             <div className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground font-serif font-bold text-sm mt-1 border border-border/40 shadow-sm">{(index ?? 0) + 1}</div>
             <Textarea placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="flex-1 bg-transparent border-0 border-b border-border/40 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary transition-all resize-none text-base md:text-lg leading-relaxed placeholder:text-muted-foreground/40" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden md:block h-1.5 w-1.5 rounded-full bg-primary/40 mt-0.5 shrink-0" />
            <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent border-0 border-b border-border/40 rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-primary transition-all text-base placeholder:text-muted-foreground/40" />
          </div>
        )}
      </div>

      {canRemove && (
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} className={cn("text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all shrink-0", !isMobile && "opacity-0 group-hover:opacity-100", isTextArea && "mt-2")} title="Remove item"><Trash2 className="h-5 w-5 md:h-4 md:w-4" /></Button>
      )}
    </div>
  )
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
  initialTags = [], // ETIQUETAS
}: RecipeFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!recipeId
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const [name, setName] = useState(initialName)
  
  const [ingredients, setIngredients] = useState<FormItem[]>(() => {
    const base = (initialIngredients && initialIngredients.length > 0) ? initialIngredients : Array(defaultIngredientsCount).fill("")
    return base.map(val => ({ id: generateId(), value: val }))
  })

  const [steps, setSteps] = useState<FormItem[]>(() => {
    const base = (initialSteps && initialSteps.length > 0) ? initialSteps : Array(defaultStepsCount).fill("")
    return base.map(val => ({ id: generateId(), value: val }))
  })

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

  // --- ESTADOS PARA ETIQUETAS ---
  const [tags, setTags] = useState<string[]>(initialTags || [])
  const [tagInput, setTagInput] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEndIngredients(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setIngredients((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  function moveItem(type: 'ingredients' | 'steps', index: number, direction: 'up' | 'down') {
    const setter = type === 'ingredients' ? setIngredients : setSteps
    setter((items) => {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= items.length) return items
      return arrayMove(items, index, newIndex)
    })
  }

  function handleDragEndSteps(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

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
    if (isEditing && recipeId) fetchLinkedComponents()
    fetchAvailableComponents()
  }, [recipeId])

  const fetchLinkedComponents = async () => {
    const { data, error } = await supabase.from("recipe_components").select("component_recipe_id, recipes!recipe_components_component_recipe_id_fkey(id, name)").eq("parent_recipe_id", recipeId)
    if (!error && data) {
      setLinkedComponents(data.map((item: any) => ({ id: item.recipes.id, name: item.recipes.name })))
    }
  }

  const fetchAvailableComponents = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let query = supabase.from("recipes").select("id, name").eq("is_component", true).eq("user_id", user.id).is("deleted_at", null)
    if (recipeId) query = query.neq("id", recipeId)
    const { data } = await query
    if (data) setAvailableComponents(data)
  }

  // --- FUNCIONES PARA ETIQUETAS ---
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '').replace(/ /g, '-')
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }
  // --------------------------------

  const addIngredient = () => setIngredients([...ingredients, { id: generateId(), value: "" }])
  const removeIngredient = (id: string) => { if (ingredients.length > 1) setIngredients(ingredients.filter((i) => i.id !== id)) }
  const updateIngredient = (id: string, newValue: string) => setIngredients(ingredients.map(item => item.id === id ? { ...item, value: newValue } : item))

  const addStep = () => setSteps([...steps, { id: generateId(), value: "" }])
  const removeStep = (id: string) => { if (steps.length > 1) setSteps(steps.filter((s) => s.id !== id)) }
  const updateStep = (id: string, newValue: string) => setSteps(steps.map(item => item.id === id ? { ...item, value: newValue } : item))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }
  
  const triggerFileInput = () => fileInputRef.current?.click()
  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  
  const addComponent = (component: SimpleRecipe) => {
    if (!linkedComponents.find(c => c.id === component.id)) setLinkedComponents([...linkedComponents, component])
    setIsComponentSearchOpen(false)
  }
  const removeComponent = (id: string) => setLinkedComponents(linkedComponents.filter(c => c.id !== id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const filteredIngredients = ingredients.map(i => i.value).filter((i) => i.trim() !== "")
      const filteredSteps = steps.map(s => s.value).filter((s) => s.trim() !== "")

      if (!name.trim()) throw new Error("Recipe name is required")
      if (filteredIngredients.length === 0) throw new Error("At least one ingredient is required")
      if (filteredSteps.length === 0) throw new Error("At least one step is required")

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      let imageUrl: string | null = initialImageUrl
      if (imageFile) {
        const blob = await upload(imageFile.name, imageFile, { access: "public", handleUploadUrl: "/api/upload", options: { addRandomSuffix: true } })
        imageUrl = blob.url
      } else if (imagePreview === null) {
        imageUrl = null
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
        tags: tags.length > 0 ? tags : null, // AÑADIMOS LAS ETIQUETAS A LA DB
        user_id: user.id,
      }

      let finalRecipeId = recipeId

      if (isEditing) {
        const { user_id, ...updateData } = recipeData
        const { error: updateError } = await supabase.from("recipes").update(updateData).eq("id", recipeId)
        if (updateError) throw updateError
      } else {
        const { data: newRecipe, error: insertError } = await supabase.from("recipes").insert(recipeData).select("id").single()
        if (insertError) throw insertError
        finalRecipeId = newRecipe.id
      }
      
      if (finalRecipeId) {
        if (isEditing) await supabase.from("recipe_components").delete().eq("parent_recipe_id", finalRecipeId)
        if (linkedComponents.length > 0) {
          const relations = linkedComponents.map(comp => ({ parent_recipe_id: finalRecipeId, component_recipe_id: comp.id }))
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
    <form onSubmit={handleSubmit} className="space-y-12 pb-24">
      
      {/* --- 1. CABECERA VISUAL --- */}
      <div className="space-y-8">
        <div onClick={triggerFileInput} className={cn("relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-xl border border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group flex flex-col items-center justify-center text-muted-foreground", imagePreview && "border-none bg-transparent shadow-sm")}>
          <Input id="image" type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          {imagePreview ? (
            <>
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md flex items-center gap-2 transform scale-95 group-hover:scale-100 transition-transform"><ImageIcon className="h-4 w-4" /> Change Photo</div></div>
              <Button type="button" variant="destructive" size="icon" className="absolute top-3 right-3 rounded-full h-8 w-8 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeImage}><X className="h-4 w-4" /></Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="p-4 bg-background rounded-full shadow-sm border border-border/50 group-hover:scale-110 transition-transform"><UploadCloud className="h-8 w-8 text-primary/60" /></div>
              <div className="text-center"><p className="text-sm font-semibold text-foreground">Add a cover photo</p></div>
            </div>
          )}
        </div>

        <div className="space-y-2 px-1">
          <Input id="name" placeholder="Recipe Title" value={name} onChange={(e) => setName(e.target.value)} required className="text-3xl md:text-5xl font-serif font-bold border-none px-0 py-4 h-auto placeholder:text-muted-foreground/30 bg-transparent focus-visible:ring-0 shadow-none text-center placeholder:font-serif" />
          <div className="h-px w-24 bg-border mx-auto"></div>
        </div>
      </div>

      {/* --- 2. METADATOS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-2">
        <div className="space-y-6">
          <h3 className="font-serif text-lg font-semibold text-foreground/80 flex items-center gap-2 uppercase tracking-wide text-xs">
            <CookingPot className="h-4 w-4" /> Essentials
          </h3>
          
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="bg-background/50 border-border/60 h-12 text-base md:text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger id="difficulty" className="bg-background/50 border-border/60 h-12 text-base md:text-sm">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SECCIÓN DE ETIQUETAS NUEVA */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-2 py-0.5 flex items-center gap-1 font-normal bg-secondary/50">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                placeholder="Type a tag & press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-background/50 border-border/60 h-11 text-base md:text-sm"
              />
            </div>
            {/* --------------------------- */}

            {!isComponent && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="prepTime">Prep (min)</Label><Input id="prepTime" type="number" inputMode="numeric" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="bg-background/50 border-border/60 h-12 text-base md:text-sm" /></div>
                <div className="space-y-2"><Label htmlFor="cookTime">Cook (min)</Label><Input id="cookTime" type="number" inputMode="numeric" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="bg-background/50 border-border/60 h-12 text-base md:text-sm" /></div>
                <div className="space-y-2"><Label htmlFor="servings">Servings</Label><Input id="servings" type="number" inputMode="numeric" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className="bg-background/50 border-border/60 h-12 text-base md:text-sm" /></div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
                    <SelectTrigger id="rating" className="bg-background/50 border-border/60 h-12 text-base md:text-sm"><SelectValue placeholder="Rating" /></SelectTrigger>
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
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-serif text-lg font-semibold text-foreground/80 flex items-center gap-2 uppercase tracking-wide text-xs">
            <Layers className="h-4 w-4" /> Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
              <div className="space-y-0.5"><Label htmlFor="isFavorite" className="text-base font-medium">Favorite</Label><p className="text-xs text-muted-foreground">Pin to top of list</p></div>
              <Switch id="isFavorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
              <div className="space-y-0.5"><Label htmlFor="isComponent" className="text-base font-medium">Component Mode</Label><p className="text-xs text-muted-foreground">Mark as sub-recipe</p></div>
              <Switch id="isComponent" checked={isComponent} onCheckedChange={setIsComponent} />
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="link">Source Link</Label>
              <Input id="link" type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} className="bg-background/50 border-border/60 h-12 text-base md:text-sm" />
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8 opacity-50" />

      {/* --- 3. INGREDIENTES --- */}
      <div className="space-y-6 max-w-4xl mx-auto px-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold flex items-center gap-2"><Utensils className="h-5 w-5 text-primary" /> Ingredients</h3>
          {!isComponent && (
             <Button type="button" variant="outline" size="sm" onClick={() => setIsComponentSearchOpen(true)} className="rounded-full h-9 text-xs border-dashed border-primary/40 text-primary hover:bg-primary/5"><Plus className="mr-1.5 h-3 w-3" /> Import</Button>
          )}
        </div>

        {!isComponent && linkedComponents.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-4 bg-secondary/20 rounded-lg border border-border/40">
            <p className="w-full text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Linked Components</p>
            {linkedComponents.map(comp => (
              <Badge key={comp.id} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-background border border-border/60 hover:bg-accent transition-colors pl-3 pr-1">
                <Layers className="h-3 w-3 text-primary" /> {comp.name}
                <button type="button" onClick={() => removeComponent(comp.id)} className="ml-2 hover:text-destructive p-1 rounded-full hover:bg-muted transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0 space-y-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndIngredients}>
              <SortableContext items={ingredients} strategy={verticalListSortingStrategy}>
                {ingredients.map((ingredient, idx) => (
                  <SortableRow key={ingredient.id} id={ingredient.id} value={ingredient.value} onChange={(val) => updateIngredient(ingredient.id, val)} onRemove={() => removeIngredient(ingredient.id)} onMoveUp={() => moveItem('ingredients', idx, 'up')} onMoveDown={() => moveItem('ingredients', idx, 'down')} isFirst={idx === 0} isLast={idx === ingredients.length - 1} placeholder="e.g. 2 cups of flour" canRemove={ingredients.length > 1} isMobile={isMobile} />
                ))}
              </SortableContext>
            </DndContext>
            <Button type="button" variant="ghost" onClick={addIngredient} className="mt-4 text-muted-foreground hover:text-primary w-full justify-start pl-0 hover:bg-transparent group h-12"><Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Add another ingredient</Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 opacity-50" />

      {/* --- 4. PASOS --- */}
      <div className="space-y-6 max-w-4xl mx-auto pb-12 px-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold flex items-center gap-2"><ListOrdered className="h-5 w-5 text-primary" /> Preparation</h3>
        </div>
        
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0 space-y-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSteps}>
              <SortableContext items={steps} strategy={verticalListSortingStrategy}>
                {steps.map((step, idx) => (
                  <SortableRow key={step.id} id={step.id} value={step.value} onChange={(val) => updateStep(step.id, val)} onRemove={() => removeStep(step.id)} onMoveUp={() => moveItem('steps', idx, 'up')} onMoveDown={() => moveItem('steps', idx, 'down')} isFirst={idx === 0} isLast={idx === steps.length - 1} placeholder={`Describe step ${idx + 1}...`} canRemove={steps.length > 1} isTextArea index={idx} isMobile={isMobile} />
                ))}
              </SortableContext>
            </DndContext>
            <Button type="button" variant="ghost" onClick={addStep} className="mt-6 text-muted-foreground hover:text-primary w-full justify-start pl-0 hover:bg-transparent group h-12"><Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Add another step</Button>
          </CardContent>
        </Card>
      </div>

      <CommandDialog open={isComponentSearchOpen} onOpenChange={setIsComponentSearchOpen}>
        <Command>
          <CommandInput placeholder="Search your components..." className="h-12 text-base" />
          <CommandList>
            <CommandEmpty>No components found.</CommandEmpty>
            <CommandGroup heading="Available Components">
              {availableComponents.map((comp) => {
                const isSelected = linkedComponents.some(c => c.id === comp.id)
                return (
                  <CommandItem key={comp.id} onSelect={() => addComponent(comp)} disabled={isSelected} className="py-3">
                    <Layers className="mr-2 h-4 w-4" /> <span className="text-base">{comp.name}</span> {isSelected && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive text-center font-medium">{error}</div>}

      {/* --- BARRA INFERIOR FLOTANTE SEGURA --- */}
      <div className="sticky bottom-0 left-0 right-0 p-4 pb-6 md:pb-4 bg-background/90 backdrop-blur-xl border-t border-border/40 flex justify-center gap-4 z-40 safe-area-pb">
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={isSubmitting} className="rounded-full px-6 md:px-8 min-w-[100px] md:min-w-[120px] h-12 md:h-10">Discard</Button>
        <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-full px-6 md:px-8 min-w-[100px] md:min-w-[120px] h-12 md:h-10 shadow-lg hover:shadow-xl transition-all">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><CookingPot className="mr-2 h-4 w-4" /> Save</>}
        </Button>
      </div>
    </form>
  )
}