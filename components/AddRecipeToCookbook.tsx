// components/AddRecipeToCookbook.tsx

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Loader2, Plus, Bookmark } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Cookbook {
  id: string
  name: string
}

interface AddRecipeToCookbookProps {
  recipeId: string
}

export function AddRecipeToCookbook({ recipeId }: AddRecipeToCookbookProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([])
  const [savedInIds, setSavedInIds] = useState<Set<string>>(new Set())
  const [newCookbookName, setNewCookbookName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 1. Obtener todos los cookbooks del usuario
      const { data: allCookbooks, error: cookbooksError } = await supabase
        .from("cookbooks")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

      if (cookbooksError) throw cookbooksError
      setCookbooks(allCookbooks || [])

      // 2. Obtener en cuáles ya está guardada esta receta
      const { data: savedCookbooks, error: savedError } = await supabase
        .from("cookbook_recipes")
        .select("cookbook_id")
        .eq("recipe_id", recipeId)

      if (savedError) throw savedError
      setSavedInIds(
        new Set(savedCookbooks?.map((cb) => cb.cookbook_id) || []),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load your cookbooks.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRecipeInCookbook = async (
    cookbookId: string,
    isSaved: boolean,
  ) => {
    try {
      if (isSaved) {
        // Quitar de la colección
        const { error } = await supabase
          .from("cookbook_recipes")
          .delete()
          .eq("cookbook_id", cookbookId)
          .eq("recipe_id", recipeId)

        if (error) throw error
        setSavedInIds((prev) => {
          const next = new Set(prev)
          next.delete(cookbookId)
          return next
        })
      } else {
        // Añadir a la colección
        const { error } = await supabase
          .from("cookbook_recipes")
          .insert({ cookbook_id: cookbookId, recipe_id: recipeId })

        if (error) throw error
        setSavedInIds((prev) => new Set(prev).add(cookbookId))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update cookbook.",
        variant: "destructive",
      })
    }
  }

  const handleCreateCookbook = async () => {
    if (!newCookbookName.trim()) return

    setIsCreating(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 1. Crear el nuevo cookbook
      const { data: newCookbook, error: createError } = await supabase
        .from("cookbooks")
        .insert({ name: newCookbookName.trim(), user_id: user.id })
        .select("id, name")
        .single()

      if (createError) throw createError
      
      // 2. Añadir la receta actual a ese nuevo cookbook
      await handleToggleRecipeInCookbook(newCookbook.id, false)
      
      // 3. Actualizar la UI
      setCookbooks([newCookbook, ...cookbooks])
      setNewCookbookName("")
      toast({
        title: "Cookbook Created",
        description: `"${newCookbook.name}" created and recipe added.`,
      })
    } catch (error) {
       toast({
        title: "Error",
        description: "Could not create new cookbook.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Bookmark className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverTrigger asChild>
        <Button variant="outline" className="hidden md:inline-flex">
          <Bookmark className="mr-2 h-4 w-4" />
          Save to...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-4">
          <h4 className="text-sm font-medium leading-none">Save to Cookbook</h4>
        </div>
        <Separator />

        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto p-2">
            {cookbooks.length === 0 ? (
               <p className="text-xs text-muted-foreground p-2 text-center">No cookbooks yet. Create one below!</p>
            ) : (
              cookbooks.map((cookbook) => {
                const isSaved = savedInIds.has(cookbook.id)
                return (
                  <div
                    key={cookbook.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleToggleRecipeInCookbook(cookbook.id, isSaved)}
                  >
                    <Checkbox
                      id={`cb-${cookbook.id}`}
                      checked={isSaved}
                      onCheckedChange={() => {}} // El click se maneja en el div
                    />
                    <label
                      htmlFor={`cb-${cookbook.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate cursor-pointer"
                    >
                      {cookbook.name}
                    </label>
                  </div>
                )
              })
            )}
          </div>
        )}

        <Separator />
        <div className="p-2 space-y-2">
          <Input
            placeholder="New cookbook name..."
            value={newCookbookName}
            onChange={(e) => setNewCookbookName(e.target.value)}
            disabled={isCreating}
          />
          <Button
            size="sm"
            className="w-full"
            onClick={handleCreateCookbook}
            disabled={isCreating || !newCookbookName.trim()}
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create & Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}