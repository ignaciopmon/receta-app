"use client"

import { useState } from "react"
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

export function RecipeImportDialog() {
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Usamos el 'action' del formulario para llamar a la Server Action
  const handleSubmit = async (formData: FormData) => {
    setIsImporting(true)
    setError(null)
    
    try {
      await importRecipeFromURL(formData)
      // El 'redirect' está en la acción del servidor,
      // así que no necesitamos cerrar el modal aquí.
    } catch (e: any) {
      setError(e.message)
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Disparador para móvil (icono) */}
        <Button variant="outline" size="icon" className="md:hidden">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogTrigger asChild>
        {/* Disparador para escritorio (texto) */}
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
        <form action={handleSubmit} className="space-y-4">
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
              <Button type="button" variant="ghost" disabled={isImporting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Generate Recipe"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}