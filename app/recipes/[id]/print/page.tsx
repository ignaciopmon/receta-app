// app/recipes/[id]/print/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PrintControl } from "@/components/print-control"

export default async function PrintRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener receta
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  // Obtener nombre del autor
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", recipe.user_id)
    .single()

  const username = profile?.username || "Unknown Chef"

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-16 max-w-4xl mx-auto print:p-0 print:max-w-none">
      <PrintControl />

      {/* Espacio para el header flotante en pantalla */}
      <div className="h-12 print:hidden"></div>

      {/* --- DISEÑO DE PÁGINA EDITORIAL --- */}
      <div className="space-y-8 print:space-y-6">
        
        {/* Encabezado */}
        <div className="text-center border-b-2 border-black pb-8 mb-8">
          <div className="uppercase tracking-[0.2em] text-xs font-bold text-gray-500 mb-4 font-sans">
            From the kitchen of {username}
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight text-balance mb-6 text-black">
            {recipe.name}
          </h1>
          {recipe.description && (
             <p className="text-lg font-serif italic text-gray-600 max-w-2xl mx-auto leading-relaxed">
               "{recipe.description}"
             </p>
          )}
        </div>

        {/* Grid de Datos */}
        <div className="grid grid-cols-4 gap-4 py-2 mb-8 font-sans">
          <div className="flex flex-col items-center justify-center text-center border-r border-gray-200 last:border-0 px-2">
             <span className="uppercase text-[9px] font-bold tracking-widest text-gray-400 mb-1">Prep Time</span>
             <span className="font-medium text-lg">{recipe.prep_time || "--"} <span className="text-xs text-gray-500">min</span></span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-r border-gray-200 last:border-0 px-2">
             <span className="uppercase text-[9px] font-bold tracking-widest text-gray-400 mb-1">Cook Time</span>
             <span className="font-medium text-lg">{recipe.cook_time || "--"} <span className="text-xs text-gray-500">min</span></span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-r border-gray-200 last:border-0 px-2">
             <span className="uppercase text-[9px] font-bold tracking-widest text-gray-400 mb-1">Servings</span>
             <span className="font-medium text-lg">{recipe.servings || "--"} <span className="text-xs text-gray-500">ppl</span></span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-2">
             <span className="uppercase text-[9px] font-bold tracking-widest text-gray-400 mb-1">Difficulty</span>
             <span className="font-medium text-lg capitalize">{recipe.difficulty || "Medium"}</span>
          </div>
        </div>

        {/* Contenido a 2 Columnas */}
        <div className="grid gap-12 md:grid-cols-[1fr_1.8fr] print:grid-cols-[1fr_1.8fr] items-start">
          
          {/* Columna Ingredientes */}
          <div className="space-y-6">
            <h3 className="font-sans font-bold text-sm uppercase tracking-widest border-b border-black pb-2 mb-4 flex items-center gap-2">
              Ingredients
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed font-serif text-gray-800">
              {recipe.ingredients.map((ingredient: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="block w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0 print:text-black" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna Pasos */}
          <div className="space-y-8">
            <h3 className="font-sans font-bold text-sm uppercase tracking-widest border-b border-black pb-2 mb-4">
              Method
            </h3>
            <div className="space-y-6">
              {recipe.steps.map((step: string, i: number) => (
                <div key={i} className="group">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest">Step</span>
                    <span className="font-serif font-bold text-xl text-black">{i + 1}</span>
                  </div>
                  <p className="text-base leading-relaxed text-justify font-serif text-gray-800">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer de Impresión */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-sans uppercase tracking-widest print:flex">
          <span>Cocina App · Private Collection</span>
          <span>Printed on {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}