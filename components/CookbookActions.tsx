// components/CookbookActions.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  // --- 'Wand2' y 'Loader2' de IA eliminados ---
  PenSquare,
  Archive,
  Loader2, // Loader2 se sigue usando para borrar
  Share2,
} from "lucide-react"
import { EditCookbookForm } from "./EditCookbookForm"

interface Cookbook {
  id: string
  name: string
  description: string | null
  is_public: boolean
  // --- CAMPOS NUEVOS ---
  cover_color: string | null
  cover_text: string | null
}

interface CookbookActionsProps {
  cookbook: Cookbook
}

export function CookbookActions({ cookbook }: CookbookActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  // --- 'isGenerating' eliminado ---
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  const publicUrl = `${window.location.origin}/profile/cookbook/${cookbook.id}`

  // --- FUNCIÓN handleGenerateCover ELIMINADA ---

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("cookbooks")
        .delete()
        .eq("id", cookbook.id)

      if (error) throw error

      toast({
        title: "Cookbook Deleted",
        description: `"${cookbook.name}" has been permanently deleted.`,
      })
      router.push("/cookbooks") // Redirigir a la biblioteca
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "Link Copied!",
      description: "Public link is in your clipboard.",
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Botón de Editar (con Dialog) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <PenSquare className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cookbook</DialogTitle>
          </DialogHeader>
          <EditCookbookForm
            cookbook={cookbook}
            onClose={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* --- BOTÓN DE IA ELIMINADO --- */}

      {/* Botón de Compartir (si es público) */}
      {cookbook.is_public && (
        <Button onClick={handleCopyLink}>
          <Share2 className="mr-2 h-4 w-4" />
          Copy Public Link
        </Button>
      )}

      {/* Botón de Borrar (con AlertDialog) */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Archive className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the cookbook "{cookbook.name}" and all
              its recipe links (it will not delete the recipes themselves). This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Yes, delete cookbook"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}