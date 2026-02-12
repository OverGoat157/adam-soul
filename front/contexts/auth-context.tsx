"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  user: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Valid credentials (hardcoded for demo)
const VALID_CREDENTIALS = [
  { username: "admin", password: "adamsoul2026" },
  { username: "partner", password: "adamsoul2026" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check authentication on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("adamsoul_authenticated")
    const storedUser = localStorage.getItem("adamsoul_user")
    
    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true)
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  // Protect routes
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

  const login = (username: string, password: string): boolean => {
    const isValid = VALID_CREDENTIALS.some(
      (cred) => cred.username === username && cred.password === password
    )

    if (isValid) {
      localStorage.setItem("adamsoul_authenticated", "true")
      localStorage.setItem("adamsoul_user", username)
      setIsAuthenticated(true)
      setUser(username)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("adamsoul_authenticated")
    localStorage.removeItem("adamsoul_user")
    setIsAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
      }}
    >
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
