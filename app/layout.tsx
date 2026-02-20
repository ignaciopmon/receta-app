// app/layout.tsx

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/lib/theme-provider"
import { MobileNav } from "@/components/mobile-nav" 
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Cocina",
  description: "Save and organize your favorite recipes",
  // NUEVO: Configuración especial para que iOS la trate como App Nativa
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cocina",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Evita zoom indeseado en inputs en iOS
  userScalable: false,
  // NUEVO: Pinta la barra de estado del móvil del color de tu tema
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_playfair.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <MobileNav /> 
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}