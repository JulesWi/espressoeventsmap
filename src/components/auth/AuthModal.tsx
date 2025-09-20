"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useAuth } from "../../hooks/useAuth"
import { LogIn, UserPlus } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "signin" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<"viewer" | "contributor">("contributor")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose()
          resetForm()
        }
      } else {
        const { error } = await signUp(email, password, displayName, role)
        if (error) {
          setError(error.message)
        } else {
          setSuccess("Check your email to confirm your account!")
          setTimeout(() => {
            onClose()
            resetForm()
          }, 3000)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setDisplayName("")
    setRole("contributor")
    setError(null)
    setSuccess(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full bg-[#4a2c2a] border-[#f5f1eb]">
        <DialogHeader>
          <DialogTitle className="text-[#f5f1eb] flex items-center gap-2">
            {mode === "signin" ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#f5f1eb]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#4a2c2a] border-[#f5f1eb] focus:ring-[#f5f1eb] text-[#f5f1eb]"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#f5f1eb]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#4a2c2a] border-[#f5f1eb] focus:ring-[#f5f1eb] text-[#f5f1eb]"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-[#f5f1eb]">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-[#4a2c2a] border-[#f5f1eb] focus:ring-[#f5f1eb] text-[#f5f1eb]"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#f5f1eb]">
                  Account Type
                </Label>
                <Select value={role} onValueChange={(value: "viewer" | "contributor") => setRole(value)}>
                  <SelectTrigger className="bg-[#4a2c2a] border-[#f5f1eb] focus:ring-[#f5f1eb] text-[#f5f1eb]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#4a2c2a] border-[#f5f1eb]">
                    <SelectItem value="viewer" className="text-[#f5f1eb]">
                      Viewer - View events only
                    </SelectItem>
                    <SelectItem value="contributor" className="text-[#f5f1eb]">
                      Contributor - Add and view events
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {error && <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">{error}</div>}

          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500 rounded text-green-200 text-sm">{success}</div>
          )}

          <Button type="submit" className="w-full bg-[#f5f1eb] text-[#4a2c2a] hover:bg-[#f5f1eb]/90" disabled={loading}>
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-[#f5f1eb] hover:underline text-sm"
            >
              {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal
