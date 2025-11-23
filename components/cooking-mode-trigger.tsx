// components/cooking-mode-trigger.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { CookingMode } from "@/components/cooking-mode"

export function CookingModeTrigger({ recipe }: { recipe: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="rounded-full shadow-md hover:shadow-lg transition-all gap-2 bg-foreground text-background hover:bg-foreground/90 px-6"
        size="lg"
      >
        <Play className="h-4 w-4 fill-current" />
        Start Cooking
      </Button>
      <CookingMode isOpen={isOpen} onClose={() => setIsOpen(false)} recipe={recipe} />
    </>
  )
}