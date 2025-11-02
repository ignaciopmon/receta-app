"use client"

import { useState, useEffect } from "react"
// --- IMPORTS ACTUALIZADOS ---
import { useFormState, useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
// ----------------------------
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Loader2 } from "lucide-react"
import { importRecipeFromURL } from "@/app/actions/import-recipe"

// Estado inicial para useFormState
const initialState = {
  error: null,
  success: false,
  params: null,
}

// 1. Creamos un componente separado para el botón de envío
// Esto es necesario para que useFormStatus() funcione
function SubmitButton() {
  const { pending } = useFormStatus() // Hook para detectar el estado de envío

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Importing...
        </>
      ) : (
        "Generate Recipe"
      )}
    </Button>
  )
}

export function RecipeImportDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  // 2. Usamos useFormState para manejar la acción del servidor
  const [state, formAction] = useFormState(importRecipeFromURL, initialState)
  
  const [error, setError] = useState<string | null>(null)

  // 3. Usamos useEffect para reaccionar a los cambios de estado
  useEffect(() => {
    // Si hay un error, lo mostramos
    if (state.error) {
      setError(state.error)
    }

    // Si hay éxito, redirigimos al cliente
    if (state.success && state.params) {
      router.push(`/recipes/new?${state.params}`)
      setOpen(false) // Cierra el modal
    }
  }, [state, router])

  // Resetea el error cuando el modal se abre/cierra
  useEffect(() => {
    if (!open) {
      setError(null)
      // Reseteamos el estado del formulario (aunque useFormState no tiene un reset simple)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:inline-flex">
          <Download className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif">Import Recipe from Web</DialogTitle>
          <DialogDescription>
            Paste a URL and the AI will try to extract the recipe details.
          </DialogDescription>
        </DialogHeader>
        
        {/* 4. El formulario ahora usa 'formAction' */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Recipe URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://www.myfavoriterecipes.com/..."
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            {/* 5. Usamos el nuevo componente de botón */}
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}