// components/EditCookbookForm.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Image as ImageIcon, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Cookbook {
  id: string
  name: string
  description: string | null
  is_public: boolean
  cover_color: string | null
  cover_text: string | null
  cover_url?: string | null // Añadido
}

interface EditCookbookFormProps {
  cookbook: Cookbook
  onClose: () => void
}

export function EditCookbookForm({ cookbook, onClose }: EditCookbookFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [name, setName] = useState(cookbook.name)
  const [description, setDescription] = useState(cookbook.description || "")
  const [isPublic, setIsPublic] = useState(cookbook.is_public)
  
  const [coverText, setCoverText] = useState(cookbook.cover_text || cookbook.name)
  const [coverColor, setCoverColor] = useState(cookbook.cover_color || "#444444")
  
  // --- ESTADOS DE IMAGEN ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(cookbook.cover_url || null)
  // -------------------------

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!name.trim()) {
      setError("Name is required.")
      setIsLoading(false)
      return
    }

    try {
      let finalCoverUrl = cookbook.cover_url

      // Si se ha seleccionado un nuevo archivo, subirlo
      if (imageFile) {
        const blob = await upload(imageFile.name, imageFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
          options: {
            addRandomSuffix: true,
          },
        })
        finalCoverUrl = blob.url
      } else if (imagePreview === null && cookbook.cover_url) {
        // Si el usuario borró la imagen existente
        finalCoverUrl = null
      }

      const { error: updateError } = await supabase
        .from("cookbooks")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          cover_text: coverText.trim() || name.trim(),
          cover_color: coverColor,
          cover_url: finalCoverUrl, // Actualizar URL
          updated_at: new Date().toISOString(),
        })
        .eq("id", cookbook.id)

      if (updateError) throw updateError

      toast({
        title: "Cookbook Updated!",
        description: "Your changes have been saved successfully.",
      })
      onClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cookbook.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What's this cookbook about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      {/* --- SECCIÓN DE PORTADA (IMAGEN Y ESTILO) --- */}
      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Cover Appearance</legend>
        
        {/* Subida de Imagen */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
           <div className="flex flex-col gap-3">
              {imagePreview ? (
                <div className="relative w-32 aspect-[3/4] rounded-md overflow-hidden border bg-muted">
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
                    id="edit-cover-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('edit-cover-upload')?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Cover
                  </Button>
                </div>
              )}
               <p className="text-xs text-muted-foreground">
                Best format: 3:4 vertical image. If uploaded, it overrides the color cover.
              </p>
            </div>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">OR CUSTOMIZE DEFAULT</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="coverText">Cover Title</Label>
          <Input
            id="coverText"
            placeholder={cookbook.name}
            value={coverText}
            onChange={(e) => setCoverText(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverColor">Cover Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="coverColor"
              type="color"
              value={coverColor}
              onChange={(e) => setCoverColor(e.target.value)}
              className="w-16 p-1 h-10"
            />
            <Input
              type="text"
              value={coverColor}
              onChange={(e) => setCoverColor(e.target.value)}
              placeholder="#444444"
              className="flex-1"
            />
          </div>
        </div>
      </fieldset>
      {/* --- FIN SECCIÓN DE PORTADA --- */}

      <div className="flex items-center space-x-3">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="isPublic" className="cursor-pointer">
          Make this cookbook public
        </Label>
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  )
}