// components/account-form.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, LogOut, Loader2, CheckCircle2 } from "lucide-react"

interface AccountFormProps {
  initialUsername: string
  userId: string
}

export function AccountForm({ initialUsername, userId }: AccountFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [username, setUsername] = useState(initialUsername)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleUsernameSave = async () => {
    setIsLoading(true)
    setMessage(null)

    if (username.length < 3) {
      setMessage({ type: 'error', text: 'Username must be at least 3 characters.' })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", userId)

      if (error) {
        if (error.code === '23505') {
          throw new Error('Username already taken. Please try another.')
        }
        throw error
      }

      setMessage({ type: 'success', text: 'Username updated successfully!' })
      router.refresh()
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-primary/5 rounded-full text-primary">
             <User className="h-5 w-5" />
          </div>
          <CardTitle className="font-serif text-xl">Profile Details</CardTitle>
        </div>
        <CardDescription>
          Update your public username and manage your session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="max-w-md bg-background/50"
            />
            {message?.type === 'success' && (
              <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-green-500 animate-in fade-in" />
            )}
          </div>
          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 border-t border-border/40 py-4">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign Out
        </Button>
        <Button
          onClick={handleUsernameSave}
          disabled={isLoading || username === initialUsername}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  )
}