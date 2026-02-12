"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: string[]
  addToFavorites: (productId: string) => void
  removeFromFavorites: (productId: string) => void
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("adamsoul_favorites")
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch {
        setFavorites([])
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("adamsoul_favorites", JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const addToFavorites = (productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) return prev
      return [...prev, productId]
    })
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      removeFromFavorites(productId)
    } else {
      addToFavorites(productId)
    }
  }

  const isFavorite = (productId: string) => {
    return favorites.includes(productId)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
