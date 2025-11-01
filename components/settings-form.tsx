"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/lib/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
// --- ICONOS ACTUALIZADOS ---
import { DoorOpen, CheckCircle, Paintbrush, Baseline } from "lucide-react"

type Theme = "light" | "dark" | "pastel"

interface SettingsFormProps {
  initialTheme: Theme
  initialIngredientsCount: number
  initialStepsCount: number
  userId: string
}

export function SettingsForm({ initialTheme, initialIngredientsCount, initialStepsCount, userId }: SettingsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const [selectedTheme, setSelectedTheme] = useState<Theme>(initialTheme)
  const [ingredientsCount, setIngredientsCount] = useState(initialIngredientsCount)
  const [stepsCount, setStepsCount] = useState(initialStepsCount)
  const [isSaving, setIsSaving] = useState(false)

  const handleThemeChange = (newTheme: Theme) => {
    setSelectedTheme(newTheme)
    setTheme(newTheme)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: userId,
        theme: selectedTheme,
        default_ingredients_count: ingredientsCount,
        default_steps_count: stepsCount,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {/* --- ICONO CAMBIADO --- */}
            <Paintbrush className="h-5 w-5" />
            <CardTitle>Theme</CardTitle>
          </div>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedTheme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300" />
              <span className="text-sm font-medium">Light</span>
            </button>

            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedTheme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-900 border-2 border-gray-700" />
              <span className="text-sm font-medium">Dark</span>
            </button>

            <button
              onClick={() => handleThemeChange("pastel")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedTheme === "pastel" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 border-2 border-pink-300" />
              <span className="text-sm font-medium">Pastel</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {/* --- ICONO CAMBIADO --- */}
            <Baseline className="h-5 w-5" />
            <CardTitle>Default Form Fields</CardTitle>
          </div>
          <CardDescription>
            Set how many ingredient and step fields appear by default when creating a recipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingredients">Default Ingredients Count</Label>
            <Input
              id="ingredients"
              type="number"
              min="1"
              max="20"
              value={ingredientsCount}
              onChange={(e) => setIngredientsCount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Default Steps Count</Label>
            <Input
              id="steps"
              type="number"
              min="1"
              max="20"
              value={stepsCount}
              onChange={(e) => setStepsCount(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {/* --- ICONO CAMBIADO --- */}
          <CheckCircle className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>

        <Button variant="destructive" onClick={handleLogout}>
          {/* --- ICONO CAMBIADO --- */}
          <DoorOpen className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}