// app/manifest.ts

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cocina App',
    short_name: 'Cocina',
    description: 'Save, organize, and discover your favorite recipes.',
    start_url: '/recipes', // La pantalla que se abrirá al iniciar la app instalada
    display: 'standalone', // ¡ESTO ES LA MAGIA! Oculta la barra del navegador
    background_color: '#fdfbf7', // Color de fondo mientras carga la app
    theme_color: '#1a1a1a', // Color de la barra de estado superior
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}