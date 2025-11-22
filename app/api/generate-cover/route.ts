// app/api/generate-cover/route.ts

import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      console.error("API Key for Google GenAI not found");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Create a beautiful, artistic, and high-quality cookbook cover image for a recipe collection titled "${title}". 
    Context/Theme: "${description || "Delicious homemade recipes"}".
    Style: Professional food photography, appetizing, elegant lighting, centered composition.
    IMPORTANT: Do NOT include any text on the image.`;

    // CAMBIO AQUÍ: Usamos 'gemini-2.0-flash' que soporta generación de imágenes
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: prompt,
      config: {
        responseModalities: ["IMAGE"], // Forzamos la respuesta como imagen
      }
    });

    let imageBuffer: Buffer | null = null;

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Data = part.inlineData.data;
          imageBuffer = Buffer.from(base64Data, "base64");
          break;
        }
      }
    }

    if (!imageBuffer) {
      throw new Error("No image data received from AI");
    }

    const filename = `ai-covers/${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.png`;
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/png",
    });

    return NextResponse.json({ url: blob.url });

  } catch (error) {
    console.error("Error generating AI cover:", error);
    // Devolvemos error pero permitimos que el flujo continúe en el cliente (fallback a sin portada)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}