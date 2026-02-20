// components/wake-lock.tsx

"use client"

import { useEffect, useRef } from "react"

export function WakeLock() {
  const wakeLockRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true

    const requestWakeLock = async () => {
      try {
        // Comprueba si el navegador del móvil soporta esta tecnología
        if ('wakeLock' in navigator) {
          // @ts-ignore
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        // Ignoramos silenciosamente si el móvil bloquea la petición (ej. por estar en modo ahorro de batería máximo)
      }
    }

    requestWakeLock()

    // Si el usuario cambia de pestaña y vuelve, el navegador suelta el bloqueo. 
    // Esta función lo vuelve a activar al regresar a la receta.
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isMounted) {
        await requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      // Cuando el usuario sale de la receta, liberamos la pantalla para ahorrar batería
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [])

  return null // Es 100% invisible en la interfaz
}