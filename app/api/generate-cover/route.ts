// app/api/generate-cover/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { GoogleGenAI } from "@google/genai"
// --- 1. LA CORRECCIÓN DE IMPORTACIÓN ---
import { put } from "@vercel/blob" // Se importa 'put' para subidas desde el servidor

// Inicializa el cliente de Google AI
// Asegúrate de tener GOOGLE_API_KEY en tus variables de entorno
const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1. Validar usuario
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

  // 2. Validar que el usuario es dueño del cookbook
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
    // --- 2. EL PROMPT ACTUALIZADO A "VINTAGE" ---
    const generationPrompt = `Generate a book cover illustration for a cookbook titled "${prompt}". The style must be vintage, emulating an antique cookbook. It should look classic, ornate, and old-fashioned. Do not include any text or words on the image. Focus on imagery related to the cookbook title, but with a retro or classic feel.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: generationPrompt,
    })

    const part = response.candidates[0].content.parts[0]
    if (!part || !part.inlineData) {
      throw new Error("AI did not return an image.")
    }

    const imageData = part.inlineData.data
    const buffer = Buffer.from(imageData, "base64")

    // 4. Subir la imagen a Vercel Blob
    // --- 1. LA CORRECCIÓN DE FUNCIÓN (put) ---
    const blob = await put( // Se usa 'put' en lugar de 'upload'
      `cookbook-covers/${user.id}/${cookbookId}.png`, 
      buffer, 
      {
        access: "public",
        contentType: "image/png",
        // handleUploadUrl no es necesario aquí porque 'put' es una subida directa
      }
    )

    // 5. Actualizar la base de datos con la nueva URL
    const { error: updateError } = await supabase
      .from("cookbooks")
      .update({ cover_url: blob.url, updated_at: new Date().toISOString() })
      .eq("id", cookbookId)

    if (updateError) {
      throw updateError
    }

    // 6. Devolver la nueva URL
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error generating cover:", error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}