// components/print-view.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Printer, 
  ArrowLeft, 
  Image as ImageIcon, 
  Type, 
  LayoutTemplate,
  ChefHat,
  Clock,
  Users,
  Flame
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface PrintViewProps {
  recipe: any
  username: string
  isPublicCollection?: boolean
}

type PrintStyle = "classic" | "modern" | "minimal"

export function PrintView({ recipe, username, isPublicCollection = false }: PrintViewProps) {
  const router = useRouter()
  const [showImage, setShowImage] = useState(true)
  const [printStyle, setPrintStyle] = useState<PrintStyle>("classic")

  // Lanzar impresión automáticamente solo la primera vez (opcional)
  // useEffect(() => { window.print() }, [])

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  // --- ESTILOS DINÁMICOS ---
  const containerStyles = {
    classic: "max-w-3xl mx-auto font-serif text-gray-900",
    modern: "max-w-4xl mx-auto font-sans text-slate-900",
    minimal: "max-w-3xl mx-auto font-mono text-black text-sm",
  }

  return (
    <div className="min-h-screen bg-white p-8 md:p-12 print:p-0">
      
      {/* --- BARRA DE CONTROL (NO SE IMPRIME) --- */}
      <div className="print:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <div className="bg-zinc-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <div className="h-6 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Switch 
                id="show-image" 
                checked={showImage} 
                onCheckedChange={setShowImage}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/30"
              />
              <Label htmlFor="show-image" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Image
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg">
             <button 
               onClick={() => setPrintStyle("classic")}
               className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", printStyle === "classic" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white")}
             >
               Classic
             </button>
             <button 
               onClick={() => setPrintStyle("modern")}
               className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", printStyle === "modern" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white")}
             >
               Modern
             </button>
             <button 
               onClick={() => setPrintStyle("minimal")}
               className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", printStyle === "minimal" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white")}
             >
               Minimal
             </button>
          </div>

          <Button onClick={() => window.print()} className="bg-white text-black hover:bg-gray-200 rounded-full px-6 w-full sm:w-auto font-semibold">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Espaciador para pantalla */}
      <div className="h-24 print:hidden" />

      {/* --- DOCUMENTO A IMPRIMIR --- */}
      <div className={cn("transition-all duration-300", containerStyles[printStyle])}>
        
        {/* 1. HEADER */}
        <header className={cn(
          "mb-8",
          printStyle === "classic" && "text-center border-b-2 border-black pb-8",
          printStyle === "modern" && "flex flex-col md:flex-row gap-8 items-end border-b border-gray-200 pb-8",
          printStyle === "minimal" && "border-b border-black pb-4 mb-4 border-dashed"
        )}>
          <div className={cn("flex-1", printStyle === "modern" && "order-2 md:order-1")}>
            <div className={cn(
              "uppercase tracking-widest text-xs text-gray-500 mb-2 font-medium",
              printStyle === "minimal" && "font-mono text-[10px]"
            )}>
              {isPublicCollection ? "Public Collection" : "Private Kitchen"} · @{username}
            </div>
            
            <h1 className={cn(
              "leading-tight text-balance mb-4",
              printStyle === "classic" && "text-5xl md:text-6xl font-bold",
              printStyle === "modern" && "text-6xl md:text-7xl font-black tracking-tighter",
              printStyle === "minimal" && "text-2xl font-bold uppercase"
            )}>
              {recipe.name}
            </h1>

            {recipe.description && (
              <p className={cn(
                "max-w-2xl leading-relaxed",
                printStyle === "classic" && "mx-auto text-lg italic text-gray-600 font-serif",
                printStyle === "modern" && "text-xl text-gray-500 font-light",
                printStyle === "minimal" && "text-xs text-gray-600"
              )}>
                {recipe.description}
              </p>
            )}
          </div>

          {/* METADATA */}
          <div className={cn(
            "flex gap-6",
            printStyle === "classic" && "justify-center mt-6",
            printStyle === "modern" && "order-1 md:order-2 mb-2",
            printStyle === "minimal" && "mt-2 text-xs"
          )}>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold">Prep</span>
                <span className="font-bold">{recipe.prep_time || "-"} min</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold">Cook</span>
                <span className="font-bold">{recipe.cook_time || "-"} min</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold">Serves</span>
                <span className="font-bold">{recipe.servings || "-"}</span>
             </div>
          </div>
        </header>

        {/* 2. IMAGEN (CONDICIONAL) */}
        {showImage && recipe.image_url && (
          <div className={cn(
            "mb-8 overflow-hidden bg-gray-100 print:grayscale", // Grayscale para ahorrar tinta de color
            printStyle === "classic" && "aspect-video rounded-sm shadow-sm",
            printStyle === "modern" && "aspect-[21/9] rounded-2xl",
            printStyle === "minimal" && "aspect-[3/1] border border-black filter grayscale contrast-125"
          )}>
            <div className="relative w-full h-full">
               {/* Usamos img normal para impresión fiable, next/image a veces da problemas en print preview */}
               <img 
                 src={recipe.image_url} 
                 alt={recipe.name} 
                 className="w-full h-full object-cover"
               />
            </div>
          </div>
        )}

        {/* 3. CONTENIDO */}
        <div className={cn(
          "grid gap-8",
          printStyle === "classic" && "md:grid-cols-[1fr_2fr] gap-12",
          printStyle === "modern" && "md:grid-cols-[1fr_2fr] gap-16",
          printStyle === "minimal" && "grid-cols-1 gap-6"
        )}>
          
          {/* INGREDIENTES */}
          <div>
            <h3 className={cn(
              "uppercase tracking-widest font-bold mb-4 border-b border-gray-200 pb-2",
              printStyle === "modern" && "text-xl border-black border-b-4",
              printStyle === "minimal" && "border-dashed border-black text-sm"
            )}>
              Ingredients
            </h3>
            <ul className={cn(
              "space-y-2",
              printStyle === "classic" && "text-sm",
              printStyle === "modern" && "text-base font-medium",
              printStyle === "minimal" && "text-xs space-y-1"
            )}>
              {recipe.ingredients.map((ing: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={cn(
                    "mt-1.5 shrink-0",
                    printStyle === "classic" && "w-1.5 h-1.5 bg-black rounded-full",
                    printStyle === "modern" && "w-2 h-2 border-2 border-black",
                    printStyle === "minimal" && "hidden" // Sin viñetas en minimal
                  )} />
                  <span className={cn(printStyle === "minimal" && "before:content-['[ ]_'] font-mono")}>
                    {ing}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* PASOS */}
          <div>
            <h3 className={cn(
              "uppercase tracking-widest font-bold mb-4 border-b border-gray-200 pb-2",
              printStyle === "modern" && "text-xl border-black border-b-4",
              printStyle === "minimal" && "border-dashed border-black text-sm"
            )}>
              Method
            </h3>
            <div className={cn(
              "space-y-6",
              printStyle === "minimal" && "space-y-4"
            )}>
              {recipe.steps.map((step: string, i: number) => (
                <div key={i} className="group">
                  <div className={cn(
                    "flex items-baseline mb-1",
                    printStyle === "classic" && "gap-2",
                    printStyle === "modern" && "flex-col gap-0 mb-2",
                    printStyle === "minimal" && "gap-2"
                  )}>
                    <span className={cn(
                      "font-bold",
                      printStyle === "classic" && "text-lg font-serif",
                      printStyle === "modern" && "text-4xl text-gray-200 font-black group-hover:text-black transition-colors",
                      printStyle === "minimal" && "text-xs bg-black text-white px-1"
                    )}>
                      {printStyle === "minimal" ? `#${i+1}` : i + 1}
                    </span>
                    {printStyle === "classic" && <span className="text-xs uppercase tracking-widest text-gray-400">Step</span>}
                  </div>
                  <p className={cn(
                    "leading-relaxed text-gray-800 text-justify",
                    printStyle === "modern" && "text-lg leading-8",
                    printStyle === "minimal" && "text-xs"
                  )}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. FOOTER IMPRESIÓN */}
        <div className={cn(
          "mt-16 pt-6 flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-400 print:flex",
          printStyle === "minimal" && "border-t border-dashed border-black mt-8 pt-2 font-mono text-black"
        )}>
          <span>Cocina App</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

      </div>
    </div>
  )
}