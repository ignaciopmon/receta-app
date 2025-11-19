"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import { BookPlus, Loader2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateCookbookButtonProps {
  userId: string
}

export function CreateCookbookButton({ userId }: CreateCookbookButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("cookbooks")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          user_id: userId,
          is_public: false, // Private by default
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
      router.refresh()
    } catch (error) {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Cookbook</DialogTitle>
          <DialogDescription>
            Create a collection to organize your recipes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
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