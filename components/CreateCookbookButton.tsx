"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookPlus, Loader2, Plus, Image as ImageIcon, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface CreateCookbookButtonProps {
  userId: string
}

export function CreateCookbookButton({ userId }: CreateCookbookButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  
  // --- ESTADOS DE IMAGEN ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

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
  
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      let coverUrl = null
      
      // 1. Subir imagen si existe
      if (imageFile) {
        const blob = await upload(imageFile.name, imageFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
          options: {
            addRandomSuffix: true,
          },
        })
        coverUrl = blob.url
      }

      // 2. Guardar en base de datos
      const { data, error } = await supabase
        .from("cookbooks")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          user_id: userId,
          is_public: false,
          cover_url: coverUrl,
          cover_text: name.trim(), // Default cover text
          cover_color: "#444444" // Default color
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Cookbook created",
        description: `"${data.name}" has been created.`,
      })
      
      setOpen(false)
      setName("")
      setDescription("")
      setImageFile(null)
      setImagePreview(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create cookbook. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <BookPlus className="mr-2 h-5 w-5" />
          New Cookbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Cookbook</DialogTitle>
          <DialogDescription>
            Create a collection to organize your recipes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Holiday Favorites"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's inside this cookbook?"
            />
          </div>
          
          {/* --- SECCIÓN DE SUBIDA DE IMAGEN --- */}
          <div className="grid gap-2">
            <Label>Cover Image (optional)</Label>
            <div className="flex flex-col gap-3">
              {imagePreview ? (
                <div className="relative w-32 aspect-[3/4] rounded-md overflow-hidden border">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Input 
                    id="cover-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('cover-upload')?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Cover
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Best format: 3:4 vertical image (e.g. 600x800px)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Cookbook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}