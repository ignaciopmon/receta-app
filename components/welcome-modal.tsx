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
import { Search, User, Settings, Check } from "lucide-react"

interface WelcomeModalProps {
  userId: string
  username: string
  onClose: () => void
}

export function WelcomeModal({ userId, username, onClose }: WelcomeModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(true)

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
      // No bloqueamos al usuario si esto falla, solo lo registramos.
    }
  }

  /**
   * Cierra el modal y lo marca como visto.
   */
  const handleClose = async () => {
    await handleMarkAsSeen()
    setIsOpen(false)
    onClose()
  }

  /**
   * Cierra el modal, lo marca como visto y redirige a Ajustes.
   */
  const handleChangeUsername = async () => {
    await handleMarkAsSeen()
    setIsOpen(false)
    onClose()
    router.push("/settings")
  }

  return (
    // Usamos onOpenChange para que al hacer clic fuera también se marque como visto
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
          {/* Tip 1: Búsqueda */}
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
          
          {/* Tip 2: Nombre de Usuario */}
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