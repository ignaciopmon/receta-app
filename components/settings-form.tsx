// components/settings-form.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/lib/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Paintbrush, Baseline, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const { setTheme } = useTheme()

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

  return (
    <div className="space-y-6">
      {/* Theme Card */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/5 rounded-full text-primary">
               <Paintbrush className="h-5 w-5" />
            </div>
            <CardTitle className="font-serif text-xl">Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleThemeChange("light")}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                selectedTheme === "light" 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
              )}
            >
              <div className="w-full aspect-video rounded-lg bg-[#fafafa] border border-gray-200 shadow-inner relative overflow-hidden">
                 <div className="absolute top-2 left-2 right-2 h-2 bg-gray-200 rounded-full opacity-50"></div>
                 <div className="absolute top-6 left-2 w-1/2 h-2 bg-gray-200 rounded-full opacity-30"></div>
              </div>
              <span className="text-sm font-medium">Light</span>
            </button>

            <button
              onClick={() => handleThemeChange("dark")}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                selectedTheme === "dark" 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
              )}
            >
              <div className="w-full aspect-video rounded-lg bg-[#1a1a1a] border border-gray-700 shadow-inner relative overflow-hidden">
                 <div className="absolute top-2 left-2 right-2 h-2 bg-gray-700 rounded-full opacity-50"></div>
                 <div className="absolute top-6 left-2 w-1/2 h-2 bg-gray-700 rounded-full opacity-30"></div>
              </div>
              <span className="text-sm font-medium">Dark</span>
            </button>

            <button
              onClick={() => handleThemeChange("pastel")}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                selectedTheme === "pastel" 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
              )}
            >
              <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border border-pink-200 shadow-inner relative overflow-hidden">
                 <div className="absolute top-2 left-2 right-2 h-2 bg-white/50 rounded-full"></div>
                 <div className="absolute top-6 left-2 w-1/2 h-2 bg-white/50 rounded-full"></div>
              </div>
              <span className="text-sm font-medium">Pastel</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Defaults Card */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/5 rounded-full text-primary">
               <Baseline className="h-5 w-5" />
            </div>
            <CardTitle className="font-serif text-xl">Editor Defaults</CardTitle>
          </div>
          <CardDescription>
            Set the default number of fields when creating a new recipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="ingredients">Default Ingredients Count</Label>
            <Input
              id="ingredients"
              type="number"
              min="1"
              max="20"
              value={ingredientsCount}
              onChange={(e) => setIngredientsCount(Number(e.target.value))}
              className="max-w-[120px]"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="steps">Default Steps Count</Label>
            <Input
              id="steps"
              type="number"
              min="1"
              max="20"
              value={stepsCount}
              onChange={(e) => setStepsCount(Number(e.target.value))}
              className="max-w-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full sm:w-auto">
          {isSaving ? (
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
             <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Saving Preferences..." : "Save All Preferences"}
        </Button>
      </div>
    </div>
  )
}