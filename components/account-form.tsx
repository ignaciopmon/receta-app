// components/account-form.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, DoorOpen, Loader2 } from "lucide-react"

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
        if (error.code === '23505') { // Error de 'unique constraint'
          throw new Error('Username already taken. Please try another.')
        }
        throw error
      }

      setMessage({ type: 'success', text: 'Username updated successfully!' })
      router.refresh() // Refresca la página para que 'initialUsername' se actualice
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>Account</CardTitle>
        </div>
        <CardDescription>
          Manage your account details and session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        {message && (
          <p className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <DoorOpen className="mr-2 h-4 w-4" />
          )}
          Logout
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