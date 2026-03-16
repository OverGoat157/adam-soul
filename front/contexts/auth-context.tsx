"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  user: string | null
  isAdmin: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = localStorage.getItem("adamsoul_user")
    const storedAdmin = localStorage.getItem("adamsoul_is_admin") === "true"
    const storedToken = localStorage.getItem("admin_token")
    if (storedUser && storedToken) {
      setIsAuthenticated(true)
      setUser(storedUser)
      setIsAdmin(storedAdmin)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const protectedRoutes = ["/catalog", "/favorites"]
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname?.startsWith(route)
      )
      if (isProtectedRoute && !isAuthenticated) {
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) return false
      const data = await res.json()

      localStorage.setItem("adamsoul_user", data.username)
      localStorage.setItem("adamsoul_is_admin", String(data.is_staff))
      localStorage.setItem("admin_token", data.token)

      setIsAuthenticated(true)
      setUser(data.username)
      setIsAdmin(data.is_staff)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("adamsoul_user")
    localStorage.removeItem("adamsoul_is_admin")
    localStorage.removeItem("admin_token")
    setIsAuthenticated(false)
    setUser(null)
    setIsAdmin(false)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
