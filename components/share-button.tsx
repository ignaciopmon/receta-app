"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ShareButtonProps {
  recipeId: string
  isPublic: boolean
}

export function ShareButton({ recipeId, isPublic }: ShareButtonProps) {
  const supabase = createClient()
  const [copied, setCopied] = useState(false)
  const [isCurrentlyPublic, setIsCurrentlyPublic] = useState(isPublic)
  const { toast } = useToast()
  
  const shareLink = `https://cocinaweb.vercel.app/share/${recipeId}`

  const handleShare = async () => {
    // Si la receta no es pública, hazla pública
    if (!isCurrentlyPublic) {
      const { error } = await supabase
        .from("recipes")
        .update({ is_public: true })
        .eq("id", recipeId)
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not make recipe public. Please try again.",
        })
        return
      }
      setIsCurrentlyPublic(true)
    }
    
    // Copia el enlace al portapapeles
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast({
      title: "Link Copied!",
      description: "Anyone with the link can now view this recipe.",
    })
    
    // Resetea el icono de "Check" después de 2 segundos
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" onClick={handleShare}>
      {copied ? (
        <Check className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <Share2 className="mr-2 h-4 w-4" />
      )}
      {copied ? "Copied" : "Share"}
    </Button>
  )
}