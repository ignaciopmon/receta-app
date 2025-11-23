// components/cooking-mode.tsx

"use client"

import * as React from "react"
import { X, ChevronLeft, ChevronRight, Check, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CookingModeProps {
  isOpen: boolean
  onClose: () => void
  recipe: {
    name: string
    ingredients: string[]
    steps: string[]
  }
}

export function CookingMode({ isOpen, onClose, recipe }: CookingModeProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [showIngredients, setShowIngredients] = React.useState(false)

  // Bloquear el scroll de la página principal cuando el modo cocina está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  if (!isOpen) return null

  const progress = ((currentStep + 1) / recipe.steps.length) * 100

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-300">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-4 py-4 md:px-8 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/50 -ml-2">
             <X className="h-6 w-6" />
           </Button>
           <div className="hidden md:block">
             <h2 className="font-serif font-bold text-xl line-clamp-1">{recipe.name}</h2>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <span className="text-sm font-medium text-muted-foreground tabular-nums mr-2">
             Step <span className="text-foreground font-bold">{currentStep + 1}</span> of {recipe.steps.length}
           </span>
           <Button 
             variant={showIngredients ? "secondary" : "outline"} 
             size="sm" 
             onClick={() => setShowIngredients(!showIngredients)}
             className={cn("gap-2 rounded-full transition-all", showIngredients && "bg-primary/10 text-primary hover:bg-primary/20")}
           >
             <Utensils className="h-4 w-4" />
             <span className="hidden sm:inline">Ingredients</span>
           </Button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Vista del Paso Actual */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-20 text-center max-w-6xl mx-auto w-full">
           <div key={currentStep} className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-8 md:gap-12 items-center max-w-4xl">
              {/* Número de paso gigante y elegante */}
              <span className="text-[8rem] md:text-[12rem] leading-none font-serif font-bold text-primary/5 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none">
                {currentStep + 1}
              </span>
              
              <p className="text-2xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight md:leading-snug text-balance text-foreground">
                {recipe.steps[currentStep]}
              </p>
           </div>
        </div>

        {/* Panel Lateral de Ingredientes (Deslizante) */}
        <div 
          className={cn(
            "absolute inset-y-0 right-0 w-full md:w-96 bg-card/95 backdrop-blur-xl border-l border-border/40 shadow-2xl transform transition-transform duration-300 ease-in-out z-30",
            showIngredients ? "translate-x-0" : "translate-x-full"
          )}
        >
           <div className="h-full flex flex-col">
              <div className="p-5 border-b border-border/40 flex justify-between items-center bg-muted/20">
                <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" /> Ingredients
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowIngredients(false)} className="md:hidden rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-6">
                <ul className="space-y-6">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex gap-4 text-base leading-relaxed text-foreground/90 group">
                      <div className="h-2 w-2 rounded-full bg-primary/40 mt-2.5 shrink-0 group-hover:bg-primary transition-colors" />
                      <span className="group-hover:text-primary transition-colors">{ing}</span>
                    </li>
                  ))}
                </ul>
                {/* Espacio extra al final */}
                <div className="h-20" />
              </ScrollArea>
           </div>
        </div>
        
        {/* Overlay oscuro para móvil cuando se abren los ingredientes */}
        {showIngredients && (
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden animate-in fade-in"
            onClick={() => setShowIngredients(false)}
          />
        )}
      </div>

      {/* --- CONTROLES INFERIORES --- */}
      <div className="px-6 py-6 md:py-8 border-t border-border/40 bg-background/80 backdrop-blur-lg z-20">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
           {/* Barra de Progreso */}
           <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${progress}%` }} 
              />
           </div>
           
           <div className="flex items-center justify-between gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="rounded-full w-32 md:w-40 h-12 border-2 border-border/60 hover:bg-muted"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Prev
              </Button>

              <Button 
                size="lg" 
                onClick={() => {
                  if (currentStep < recipe.steps.length - 1) {
                    setCurrentStep(currentStep + 1)
                  } else {
                    onClose() // Terminar
                  }
                }}
                className={cn(
                  "rounded-full w-32 md:w-40 h-12 shadow-lg hover:shadow-xl transition-all text-base font-semibold",
                  currentStep === recipe.steps.length - 1 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                {currentStep === recipe.steps.length - 1 ? (
                  <>Finish <Check className="ml-2 h-5 w-5" /></>
                ) : (
                  <>Next <ChevronRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}