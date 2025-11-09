// components/welcome-modal.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, User, Settings, Check, AlertTriangle, Loader2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WelcomeModalProps {
  userId: string
  username: string
  onClose: () => void
}

// --- REGEX DE VALIDACIÓN (el mismo que en sign-up) ---
const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
// ---------------------------------------------------

export function WelcomeModal({ userId, username, onClose }: WelcomeModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(true)

  // --- ESTADOS PARA EL NUEVO FORMULARIO ---
  const [newUsername, setNewUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // ----------------------------------------

  // --- LÓGICA DE VALIDACIÓN ---
  // Comprobamos si el username actual (ej. el que tiene '@') es válido
  const isUsernameValid = usernameRegex.test(username)
  // ----------------------------

  /**
   * Marca el modal como visto en la base de datos para que no vuelva a aparecer.
   */
  const handleMarkAsSeen = async () => {
    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({ has_seen_welcome_modal: true })
        .eq("user_id", userId)
      
      if (error) throw error
    } catch (error) {
      console.error("Error marking welcome modal as seen:", error)
    }
  }

  /**
   * Cierra el modal y lo marca como visto.
   * (Solo para el modal de bienvenida normal)
   */
  const handleClose = async () => {
    await handleMarkAsSeen()
    setIsOpen(false)
    onClose()
  }

  /**
   * Cierra el modal, lo marca como visto y redirige a Ajustes.
   * (Solo para el modal de bienvenida normal)
   */
  const handleChangeUsername = async () => {
    await handleMarkAsSeen()
    setIsOpen(false)
    onClose()
    router.push("/settings")
  }

  /**
   * FUERZA el cambio de nombre de usuario desde el modal de error.
   */
  const handleForceUsernameChange = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    const trimmedUsername = newUsername.trim()

    // 1. Validar el nuevo nombre de usuario
    if (!usernameRegex.test(trimmedUsername)) {
      setErrorMessage("Username must be 3-20 characters and can only contain letters, numbers, underscores (_), and hyphens (-).")
      setIsLoading(false)
      return
    }

    try {
      // 2. Intentar actualizar en la base de datos
      const { error } = await supabase
        .from("profiles")
        .update({ username: trimmedUsername })
        .eq("id", userId)

      if (error) {
        if (error.code === '23505') { // Error de 'unique constraint'
          throw new Error('Username already taken. Please try another.')
        }
        throw error
      }

      // 3. Si tiene éxito, marcar el modal como visto y cerrar.
      await handleMarkAsSeen()
      setIsOpen(false)
      onClose()
      router.refresh() // Recarga la página para que todo se actualice
      
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // --- RENDERIZADO CONDICIONAL ---
  // Si el nombre de usuario NO es válido, muestra el modal de "forzar cambio".
  if (!isUsernameValid) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-serif">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Invalid Username
            </DialogTitle>
            <DialogDescription className="pt-2 text-left">
              Your current username <strong className="text-primary">@{username}</strong> contains invalid characters (like '@').
              <br /><br />
              Please set a new, valid username to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="newUsername">New Username</Label>
            <Input
              id="newUsername"
              placeholder="e.g., your_new_username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleForceUsernameChange} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Si el nombre de usuario ES válido, muestra el modal de bienvenida normal.
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-serif">
            <Search className="h-6 w-6 text-primary" />
            Welcome to Cocina!
          </DialogTitle>
          <DialogDescription className="pt-2 text-left">
            Here are a couple of quick tips to get you started:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3">
            <Search className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Discover Other Users</h4>
              <p className="text-sm text-muted-foreground">
                You can find other users and their public recipes by using the{" "}
                <strong>Search</strong> button in the header.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Your Username</h4>
              <p className="text-sm text-muted-foreground">
                Your current username is <strong className="text-primary">@{username}</strong>.
                Would you like to keep it or change it?
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" onClick={handleChangeUsername}>
            <Settings className="mr-2 h-4 w-4" />
            Change Username
          </Button>
          <Button onClick={handleClose}>
            <Check className="mr-2 h-4 w-4" />
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}