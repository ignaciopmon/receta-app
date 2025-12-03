"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts"
import { Star, Utensils, Award, ChefHat, TrendingUp } from "lucide-react"

interface Recipe {
  id: string
  name: string
  category: string | null
  difficulty: string | null
  is_favorite: boolean
  rating: number | null
  is_component: boolean
}

interface StatsDashboardProps {
  recipes: Recipe[]
}

const chartConfig = {
  count: {
    label: "Recipes",
  },
  breakfast: {
    label: "Breakfast",
    color: "hsl(var(--chart-1))",
  },
  lunch: {
    label: "Lunch",
    color: "hsl(var(--chart-2))",
  },
  dinner: {
    label: "Dinner",
    color: "hsl(var(--chart-3))",
  },
  dessert: {
    label: "Dessert",
    color: "hsl(var(--chart-4))",
  },
  snack: {
    label: "Snack",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted-foreground))",
  },
  easy: {
    label: "Easy",
    color: "hsl(var(--chart-2))",
  },
  medium: {
    label: "Medium",
    color: "hsl(var(--chart-4))",
  },
  hard: {
    label: "Hard",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function StatsDashboard({ recipes }: StatsDashboardProps) {
  // Filter out components for general stats, but maybe keep them for total counts if desired.
  // Generally, stats are more meaningful for actual recipes.
  const realRecipes = useMemo(() => recipes.filter(r => !r.is_component), [recipes])

  const totalRecipes = realRecipes.length
  const favoriteCount = realRecipes.filter(r => r.is_favorite).length
  const averageRating = useMemo(() => {
    const ratedRecipes = realRecipes.filter(r => r.rating !== null && r.rating > 0)
    if (ratedRecipes.length === 0) return 0
    const sum = ratedRecipes.reduce((acc, r) => acc + (r.rating || 0), 0)
    return (sum / ratedRecipes.length).toFixed(1)
  }, [realRecipes])

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    realRecipes.forEach(r => {
      const cat = r.category || "other"
      counts[cat] = (counts[cat] || 0) + 1
    })

    // Map specific categories to colors, others to 'other'
    return Object.entries(counts).map(([name, value]) => {
        // Simple mapping to ensure keys exist in config or fallback
        let key = name.toLowerCase()
        if (!chartConfig[key as keyof typeof chartConfig] && key !== 'other') {
            key = 'other'
        }
        return {
            category: name,
            count: value,
            fill: `var(--color-${key}, var(--color-other))`,
        }
    }).sort((a, b) => b.count - a.count)
  }, [realRecipes])

  const difficultyData = useMemo(() => {
    const counts = { easy: 0, medium: 0, hard: 0 }
    realRecipes.forEach(r => {
      if (r.difficulty === 'easy') counts.easy++
      else if (r.difficulty === 'medium') counts.medium++
      else if (r.difficulty === 'hard') counts.hard++
    })
    return [
      { difficulty: "Easy", count: counts.easy, fill: "var(--color-easy)" },
      { difficulty: "Medium", count: counts.medium, fill: "var(--color-medium)" },
      { difficulty: "Hard", count: counts.hard, fill: "var(--color-hard)" },
    ]
  }, [realRecipes])

  if (totalRecipes === 0) {
    return null
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
             <div className="p-2 bg-primary/10 rounded-full text-primary">
               <Utensils className="h-5 w-5" />
             </div>
             <div>
               <p className="text-3xl font-bold font-serif">{totalRecipes}</p>
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Recipes</p>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/10 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
             <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-600 dark:text-yellow-400">
               <Star className="h-5 w-5" />
             </div>
             <div>
               <p className="text-3xl font-bold font-serif">{favoriteCount}</p>
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Favorites</p>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/10 shadow-sm">
           <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
             <div className="p-2 bg-green-500/10 rounded-full text-green-600 dark:text-green-400">
               <Award className="h-5 w-5" />
             </div>
             <div>
               <p className="text-3xl font-bold font-serif">{averageRating}</p>
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Avg Rating</p>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/10 shadow-sm">
           <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
             <div className="p-2 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
               <ChefHat className="h-5 w-5" />
             </div>
             <div>
               <p className="text-3xl font-bold font-serif text-nowrap capitalize truncate max-w-[100px]">{categoryData[0]?.category || "N/A"}</p>
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Top Category</p>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Chart */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-base font-medium">Category Distribution</CardTitle>
            <CardDescription>
              Diversity of your culinary collection
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <LabelList
                    dataKey="category"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: keyof typeof chartConfig) =>
                      chartConfig[value]?.label
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Difficulty Chart */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader className="items-center pb-0">
             <CardTitle className="text-base font-medium">Difficulty Levels</CardTitle>
             <CardDescription>
               Complexity of your recipes
             </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
             <ChartContainer config={chartConfig} className="max-h-[250px] w-full">
                <BarChart
                  accessibilityLayer
                  data={difficultyData}
                  layout="vertical"
                  margin={{
                    left: 20,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" dataKey="count" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" layout="vertical" radius={5}>
                     <LabelList
                        dataKey="difficulty"
                        position="insideLeft"
                        offset={8}
                        className="fill-white font-medium"
                        fontSize={12}
                      />
                      <LabelList
                        dataKey="count"
                        position="right"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                      />
                  </Bar>
                </BarChart>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
