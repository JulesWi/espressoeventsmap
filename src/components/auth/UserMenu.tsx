"use client"

import React, { useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useAuth } from "../../hooks/useAuth"
import AuthModal from "./AuthModal"
import { User, LogOut, Shield, Eye } from "lucide-react"

export function UserMenu() {
  const { user, profile, signOut, isContributor } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Sign out error:', error)
        // Vous pouvez ajouter une notification d'erreur ici
      } else {
        // Redirection ou rechargement de la page après déconnexion
        window.location.reload()
      }
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  if (!user) {
    return (
      <>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-[#f5f1eb] border-[#f5f1eb] hover:bg-[#f5f1eb]/20 bg-[#4a2c2a]"
            onClick={() => openAuthModal("signin")}
          >
            <User className="w-4 h-4 mr-1" />
            Sign In
          </Button>
          <Button
            size="sm"
            className="bg-[#f5f1eb] text-[#4a2c2a] hover:bg-[#f5f1eb]/90"
            onClick={() => openAuthModal("signup")}
          >
            Join as Contributor
          </Button>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-[#f5f1eb] border-[#f5f1eb] hover:bg-[#f5f1eb]/20 bg-[#4a2c2a] flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          {profile?.display_name || user.email?.split("@")[0]}
          {isContributor ? <Shield className="w-3 h-3 text-green-400" /> : <Eye className="w-3 h-3 text-blue-400" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#4a2c2a] border-[#f5f1eb] text-[#f5f1eb]">
        <DropdownMenuItem className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {profile?.display_name || "Profile"}
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          {isContributor ? (
            <>
              <Shield className="w-4 h-4 text-green-400" />
              Contributor Access
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-blue-400" />
              Viewer Access
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#f5f1eb]/20" />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-400">
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
