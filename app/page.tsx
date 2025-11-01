"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  // 1. Estado para controlar la animación de introducción
  const [isIntro, setIsIntro] = useState(true)

  // 2. Efecto para cambiar el estado después de un tiempo
  useEffect(() => {
    // Muestra la intro "Welcome to Cocina" por 1.5 segundos
    const timer = setTimeout(() => {
      setIsIntro(false)
    }, 1500)

    // Limpia el temporizador si el componente se desmonta
    return () => clearTimeout(timer)
  }, []) // El array vacío asegura que esto solo se ejecute una vez

  return (
    // Usamos 'relative' y 'overflow-hidden' para gestionar las animaciones
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/30 p-4">
      
      {/* GRUPO 1: El texto de bienvenida (que desaparece) */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out",
          isIntro
            ? "opacity-100 translate-y-0" // Estado inicial: visible y centrado
            : "opacity-0 -translate-y-16" // Estado final: invisible y movido hacia arriba
        )}
      >
        <h1 className="text-5xl font-bold tracking-tight text-balance">
          Welcome to <span className="font-serif">Cocina</span>
        </h1>
      </div>

      {/* GRUPO 2: El contenido final (que aparece) */}
      <div
        className={cn(
          "text-center space-y-6 max-w-2xl transition-all duration-700 ease-in-out",
          isIntro
            ? "opacity-0 translate-y-16" // Estado inicial: invisible y movido hacia abajo
            : "opacity-100 translate-y-0 delay-500" // Estado final: visible, centrado y con un retraso
        )}
      >
        {/* Título final */}
        <h1 className="text-5xl font-bold tracking-tight text-balance">
          <span className="font-serif">Cocina</span>
        </h1>

        {/* Botones finales */}
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}