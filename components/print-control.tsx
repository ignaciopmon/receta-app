"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function PrintControl() {
  const router = useRouter()

  useEffect(() => {
    // Opcional: Lanzar impresión automáticamente al cargar
    // window.print()
  }, [])

  return (
    <div className="print:hidden fixed top-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-b border-gray-200 flex justify-between items-center z-50 shadow-sm">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600 hover:text-black hover:bg-gray-100 rounded-full">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recipe
      </Button>
      <div className="flex gap-2">
        <Button onClick={() => window.print()} className="bg-black text-white hover:bg-gray-800 rounded-full px-6 shadow-md">
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
    </div>
  )
}