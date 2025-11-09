// components/EditCookbookForm.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Cookbook {
  id: string
  name: string
  description: string | null
  is_public: boolean
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const { error: updateError } = await supabase
        .from("cookbooks")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
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