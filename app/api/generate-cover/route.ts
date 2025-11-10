// app/api/generate-cover/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob" // Para subir a Vercel Blob

// --- Configuración de Freepik ---
// (Mueve esta clave a .env.local como FREEPIK_API_KEY)
const FREEPIK_API_KEY = "FPSX0c2cf6426e5d296aa4e2b7c54de0c0eb"
const FREEPIK_URL = "https://api.freepik.com/v1/ai/gemini-2.5-flash-image-preview"

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1. Validar usuario (sin cambios)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const {
    prompt,
    cookbookId,
  }: { prompt: string; cookbookId: string } = await request.json()

  if (!prompt || !cookbookId) {
    return NextResponse.json(
      { error: "Prompt and cookbookId are required" },
      { status: 400 },
    )
  }

  // 2. Validar que el usuario es dueño del cookbook (sin cambios)
  const { data: cookbook, error: cookbookError } = await supabase
    .from("cookbooks")
    .select("id")
    .eq("id", cookbookId)
    .eq("user_id", user.id)
    .single()

  if (cookbookError || !cookbook) {
    return NextResponse.json(
      { error: "Cookbook not found or unauthorized" },
      { status: 404 },
    )
  }

  try {
    // 3. Generar la imagen con Freepik
    const generationPrompt = `A beautiful, artistic book cover illustration for a cookbook titled "${prompt}". The style must be vintage, emulating an antique cookbook. It should look classic, ornate, and old-fashioned. Do not include any text or words on the image. Focus on rich textures and imagery related to the cookbook title, but with a retro or classic feel.`

    const freepikOptions = {
      method: 'POST',
      headers: {
        'x-freepik-api-key': process.env.FREEPIK_API_KEY || FREEPIK_API_KEY,
        'Content-Type': 'application/json'
      },
      // No usamos reference_images ni webhook_url para esta solicitud síncrona
      body: JSON.stringify({
        prompt: generationPrompt
      })
    }

    const freepikResponse = await fetch(FREEPIK_URL, freepikOptions)
    if (!freepikResponse.ok) {
      const errorData = await freepikResponse.json()
      throw new Error(`Freepik API Error: ${errorData.message || freepikResponse.statusText}`)
    }

    const freepikData = await freepikResponse.json()

    // La respuesta de Freepik tiene la URL en data[0].url
    const temporaryImageUrl = freepikData.data?.[0]?.url
    if (!temporaryImageUrl) {
      throw new Error("Freepik API did not return an image URL.")
    }

    // 4. Descargar la imagen de la URL temporal de Freepik
    const imageResponse = await fetch(temporaryImageUrl)
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from Freepik URL.")
    }
    // Convertir la imagen a un ArrayBuffer
    const imageArrayBuffer = await imageResponse.arrayBuffer()
    // Convertir el ArrayBuffer a un Buffer de Node.js
    const imageBuffer = Buffer.from(imageArrayBuffer)

    // 5. Subir la imagen (Buffer) a Vercel Blob
    const blob = await put(
      `cookbook-covers/${user.id}/${cookbookId}-${Date.now()}.png`, // Añadimos timestamp para evitar caché
      imageBuffer,
      {
        access: "public",
        contentType: "image/png",
      }
    )

    // 6. Actualizar la base de datos con la nueva URL de Vercel Blob
    const { error: updateError } = await supabase
      .from("cookbooks")
      .update({ cover_url: blob.url, updated_at: new Date().toISOString() })
      .eq("id", cookbookId)

    if (updateError) {
      throw updateError
    }

    // 7. Devolver la URL de Vercel Blob
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error generating cover:", error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}