"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import * as cheerio from "cheerio"
import { redirect } from "next/navigation"

// 1. Inicializa el cliente de Google AI (Gemini)
// Lee la API key de forma segura desde las variables de entorno
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

// 2. Define la acción que se llamará desde el cliente
export async function importRecipeFromURL(formData: FormData) {
  const url = formData.get("url") as string
  if (!url) {
    throw new Error("URL is required")
  }

  let recipeTextContent = ""
  let recipeName = ""

  try {
    // 3. Obtiene el contenido HTML de la URL
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }
    const html = await response.text()

    // 4. "Scrapea" la web para obtener el texto
    const $ = cheerio.load(html)
    
    // Intenta obtener el título de la página
    recipeName = $("head > title").text()
    
    // Obtiene el texto del cuerpo. Esto es básico y puede incluir
    // menús, anuncios, etc., pero se lo pasaremos a la IA para que lo limpie.
    recipeTextContent = $("body").text()

    // Limpia espacios en blanco masivos
    recipeTextContent = recipeTextContent.replace(/\s\s+/g, ' ').trim()

  } catch (error) {
    console.error("Error scraping URL:", error)
    throw new Error("Could not read the provided URL. Please check the link and try again.")
  }

  // 5. Prepara el prompt para Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
  const prompt = `
    Eres un asistente de cocina experto. Analiza el siguiente texto extraído de una página web y extrae los detalles de la receta.
    Responde ÚNICAMENTE con un objeto JSON. No incluyas "'''json" ni ningún otro texto antes o después.

    El texto a analizar es:
    "${recipeTextContent.substring(0, 10000)}" 

    Tu objeto JSON debe tener la siguiente estructura:
    {
      "name": "El nombre de la receta (usa '${recipeName}' como pista si lo necesitas)",
      "ingredients": ["lista de ingredientes, tal cual aparecen en el texto"],
      "steps": ["lista de pasos de la instrucción, tal cual aparecen en el texto"],
      "category": "Una de las siguientes opciones: 'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage'",
      "difficulty": "Una de las siguientes opciones: 'easy', 'medium', 'hard'"
    }

    Analiza el idioma del texto y devuelve los campos "name", "ingredients" y "steps" en ese mismo idioma.
    Si no puedes encontrar una receta, devuelve un JSON con valores nulos.
  `

  try {
    // 6. Llama a la IA
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Limpia la respuesta por si Gemini añade markdown
    const jsonText = responseText.replace(/```json|```/g, '').trim()
    const parsedData = JSON.parse(jsonText)

    // 7. Prepara los datos para redirigir al formulario
    const params = new URLSearchParams()
    params.set('name', parsedData.name || recipeName) // Usa el título de la página como fallback
    params.set('category', parsedData.category || 'lunch')
    params.set('difficulty', parsedData.difficulty || 'easy')
    params.set('link', url) // Añade el link de origen

    if (parsedData.ingredients && Array.isArray(parsedData.ingredients)) {
      parsedData.ingredients.forEach((ing: string) => params.append('ingredients', ing))
    }
    if (parsedData.steps && Array.isArray(parsedData.steps)) {
      parsedData.steps.forEach((step: string) => params.append('steps', step))
    }

    // 8. Redirige al usuario a la página de "Nueva Receta" con los campos rellenados
    redirect(`/recipes/new?${params.toString()}`)

  } catch (error) {
    console.error("Error processing Gemini response:", error)
    throw new Error("The AI could not understand the recipe from that URL.")
  }
}