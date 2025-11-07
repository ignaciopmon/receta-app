// app/page.tsx

import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, UtensilsCrossed } from "lucide-react"
import Link from "next/link"

// Esta es tu nueva página de inicio pública.
// No necesita "use client" y usará animaciones CSS.
// El middleware se encargará de redirigir a los usuarios
// que SÍ estén logueados a /recipes.
export default function PublicHomePage() {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Contenedor principal para centrar el contenido */}
      <div className="relative flex flex-col items-center justify-center space-y-8">
        
        {/* 1. El logo y título que se animarán hacia arriba */}
        <div className="animate-logo-intro-and-move flex flex-col items-center gap-4">
          <UtensilsCrossed className="h-20 w-20 text-primary md:h-24 md:w-24" />
          <h1 className="text-6xl font-serif font-bold text-center md:text-7xl">
            Cocina
          </h1>
        </div>

        {/* 2. Los botones que aparecerán después */}
        {/* --- CAMBIOS AQUÍ --- 
           - 'sm:w-auto' en el contenedor
           - 'w-full sm:w-auto' en los botones
           - Texto en inglés
        */}
        <div className="animate-buttons-fade-in flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/auth/login">
              <LogIn className="mr-2 h-5 w-5" />
              Log In
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/auth/sign-up">
              <UserPlus className="mr-2 h-5 w-5" />
              Sign Up
            </Link>
          </Button>
        </div>

      </div>
    </main>
  )
}