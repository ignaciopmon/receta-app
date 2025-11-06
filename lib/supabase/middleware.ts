// lib/supabase/middleware.ts

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 1. Si el usuario ESTÁ logueado
  if (user) {
    // Si intenta acceder a la homepage o a las páginas de auth, redirigir a /recipes
    if (pathname === "/" || pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone()
      url.pathname = "/recipes"
      return NextResponse.redirect(url)
    }
  }

  // 2. Si el usuario NO ESTÁ logueado
  if (!user) {
    // Si intenta acceder a cualquier página protegida (que NO sea / o /auth/*)
    // redirigir a /auth/login
    if (
      pathname !== "/" &&
      !pathname.startsWith("/auth") &&
      // --- AÑADIMOS ESTAS EXCEPCIONES ---
      !pathname.startsWith("/profile") && // Permite ver perfiles públicos
      !pathname.startsWith("/search") // Permite usar la búsqueda pública
      // ------------------------------------
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
  }
  return supabaseResponse
}