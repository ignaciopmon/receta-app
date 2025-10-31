import { Button } from "@/components/ui/button"
import { ChefHat } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-6">
            <ChefHat className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-balance">Welcome to Recipe Book</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Your personal collection of delicious recipes. Save, organize, and share your favorite dishes all in one
          place.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
