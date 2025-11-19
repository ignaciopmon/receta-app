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
  PenSquare,
  Archive,
  Loader2,
  Share2,
  Globe,
  Lock
} from "lucide-react"
import { EditCookbookForm } from "./EditCookbookForm"

interface Cookbook {
  id: string
  name: string
  description: string | null
  is_public: boolean
  cover_color: string | null
  cover_text: string | null
}

interface CookbookActionsProps {
  cookbook: Cookbook
}

export function CookbookActions({ cookbook }: CookbookActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  // Estado para el toggle de visibilidad
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false)
  
  const publicUrl = `${window.location.origin}/profile/cookbook/${cookbook.id}`

  const handleDelete = async () => {
    setIsDeleting(true)
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
      router.push("/cookbooks") 
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

  const handleToggleVisibility = async () => {
    setIsTogglingVisibility(true)
    const newValue = !cookbook.is_public
    
    try {
       const { error } = await supabase
        .from("cookbooks")
        .update({ is_public: newValue })
        .eq("id", cookbook.id)

      if (error) throw error

      toast({
        title: newValue ? "Cookbook Published" : "Cookbook Made Private",
        description: newValue 
          ? "Anyone with the link can now view this cookbook." 
          : "This cookbook is now only visible to you.",
      })
      router.refresh()
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to update cookbook visibility.",
        variant: "destructive",
      })
    } finally {
      setIsTogglingVisibility(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Botón de Publicar/Privatizar */}
      <Button 
        variant="outline" 
        onClick={handleToggleVisibility} 
        disabled={isTogglingVisibility}
      >
        {isTogglingVisibility ? (
           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : cookbook.is_public ? (
           <Lock className="mr-2 h-4 w-4" />
        ) : (
           <Globe className="mr-2 h-4 w-4" />
        )}
        {cookbook.is_public ? "Make Private" : "Publish"}
      </Button>

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

      {/* Botón de Compartir (si es público) */}
      {cookbook.is_public && (
        <Button onClick={handleCopyLink}>
          <Share2 className="mr-2 h-4 w-4" />
          Copy Link
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
              its recipe links (it will not delete the recipes themselves).
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