"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

function getToken() {
  return localStorage.getItem("admin_token") || ""
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Загружаем избранное с сервера после монтирования
  useEffect(() => {
    const load = async () => {
      const token = getToken()
      if (!token) {
        // Не авторизован — пустой список
        setIsLoaded(true)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/favorites`, {
          headers: { Authorization: `Token ${token}` },
          cache: "no-store",
        })
        if (res.ok) {
          const ids: number[] = await res.json()
          setFavorites(ids.map(String))
        }
      } catch {
        // Нет соединения — ничего страшного
      } finally {
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  const toggleFavorite = useCallback(async (productId: string) => {
    const token = getToken()
    const already = favorites.includes(productId)

    // Оптимистичное обновление
    setFavorites(prev =>
      already ? prev.filter(id => id !== productId) : [...prev, productId]
    )

    if (!token) return

    try {
      if (already) {
        await fetch(`${API_BASE}/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        })
      } else {
        await fetch(`${API_BASE}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ product_id: Number(productId) }),
        })
      }
    } catch {
      // Откат если запрос упал
      setFavorites(prev =>
        already ? [...prev, productId] : prev.filter(id => id !== productId)
      )
    }
  }, [favorites])

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite: (id) => favorites.includes(id),
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
