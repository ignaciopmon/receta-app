"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import * as cheerio from "cheerio"

// Definimos el estado que devolverá esta acción
interface ImportState {
  error: string | null
  success: boolean
  params: string | null // Aquí irán los parámetros de la URL
}

export async function importRecipeFromURL(
  prevState: ImportState, // Estado anterior (requerido por useFormState)
  formData: FormData,
): Promise<ImportState> {
  const url = formData.get("url") as string
  if (!url) {
    return { error: "URL is required", success: false, params: null }
  }

  // 1. Verificación de la API Key
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error("GOOGLE_GEMINI_API_KEY is not set on the server.")
    return { error: "AI service is not configured. Please contact the administrator.", success: false, params: null }
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

  let recipeTextContent = ""
  let recipeName = ""

  try {
    // 2. Scrapeo de la URL
    const response = await fetch(url)
    if (!response.ok) {
      return { error: `Failed to fetch URL: ${response.statusText}`, success: false, params: null }
    }
    const html = await response.text()
    const $ = cheerio.load(html)
    recipeName = $("head > title").text()

    // --- ¡NUEVA LÓGICA DE SCRAPEO MÁS INTELIGENTE! ---
    // Intenta encontrar un contenedor de receta específico.
    // Estas son clases/IDs comunes en blogs de recetas.
    let $content = 
      $('[class*="recipe-content"]').first() ||
      $('[id*="recipe-container"]').first() ||
      $('[class*="wprm-recipe-container"]').first() ||
      $('[class*="mv-recipe-card"]').first() ||
      $('[class*="recipe-card"]').first() ||
      $('[class*="recipe-main"]').first() ||
      $('[itemtype*="schema.org/Recipe"]').first()

    if ($content.length > 0) {
      recipeTextContent = $content.text()
    } else {
      // Si no encuentra uno específico, prueba con <main>
      $content = $("main").first()
      if ($content.length > 0) {
        recipeTextContent = $content.text()
      } else {
        // Si no, prueba con <article>
        $content = $("article").first()
        if ($content.length > 0) {
          recipeTextContent = $content.text()
        } else {
          // Si todo falla, vuelve a usar el body (menos probable que funcione)
          recipeTextContent = $("body").text()
        }
      }
    }
    // ------------------------------------------------

    recipeTextContent = recipeTextContent.replace(/\s\s+/g, ' ').trim()
    
    if (!recipeTextContent) {
       return { error: "Could not find any recipe content on that page.", success: false, params: null }
    }

  } catch (error) {
    console.error("Error scraping URL:", error)
    return { error: "Could not read the provided URL. Please check the link.", success: false, params: null }
  }

  // 3. Llamada a Gemini
  try {
    // Usamos el modelo estable 'gemini-1.5-flash-latest' o el que prefieras
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })
    const prompt = `
      Eres un asistente de cocina experto. Analiza el siguiente texto extraído de una página web y extrae los detalles de la receta.
      El texto está "sucio" y puede contener anuncios o texto irrelevante. Ignóralo y enfócate en la receta.
      Responde ÚNICAMENTE con un objeto JSON. No incluyas "'''json" ni ningún otro texto antes o después.

      El texto a analizar es:
      "${recipeTextContent.substring(0, 15000)}" 

      Tu objeto JSON debe tener la siguiente estructura:
      {
        "name": "El nombre de la receta (usa '${recipeName}' como pista si lo necesitas)",
        "ingredients": ["lista de ingredientes, tal cual aparecen en el texto"],
        "steps": ["lista de pasos de la instrucción, tal cual aparecen en el texto"],
        "category": "Una de las siguientes opciones: 'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage'",
        "difficulty": "Una de las siguientes opciones: 'easy', 'medium', 'hard'"
      }

      Analiza el idioma del texto y devuelve los campos "name", "ingredients" y "steps" en ese mismo idioma.
      Si no puedes encontrar una receta, devuelve un JSON con valores nulos para 'ingredients' y 'steps'.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const jsonText = responseText.replace(/```json|```/g, '').trim()
    const parsedData = JSON.parse(jsonText)

    // 4. Preparar datos de éxito
    const params = new URLSearchParams()
    params.set('name', parsedData.name || recipeName)
    params.set('category', parsedData.category || 'lunch')
    params.set('difficulty', parsedData.difficulty || 'easy')
    params.set('link', url)

    if (parsedData.ingredients && Array.isArray(parsedData.ingredients)) {
      parsedData.ingredients.forEach((ing: string) => {
        if (ing && ing.trim() !== "") params.append('ingredients', ing)
      })
    }
    if (parsedData.steps && Array.isArray(parsedData.steps)) {
      parsedData.steps.forEach((step: string) => {
        if (step && step.trim() !== "") params.append('steps', step)
      })
    }

    // 5. Devolver éxito con los parámetros
    return {
      success: true,
      params: params.toString(),
      error: null,
    }

  } catch (error) {
    console.error("Error processing Gemini response:", error)
    return { error: "The AI could not understand the recipe from that URL.", success: false, params: null }
  }
}