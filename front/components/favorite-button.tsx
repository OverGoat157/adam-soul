"use client"

import { Heart } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  productId: string
  className?: string
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isInFavorites = isFavorite(productId)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation() // Prevent card click
        e.preventDefault()
        toggleFavorite(productId)
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
        isInFavorites 
          ? "border-[#E53E3E]/20 bg-[#FFF5F5]/90" 
          : "border-[#E0E0E0]",
        className
      )}
      aria-label={isInFavorites ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart
        className={cn(
          "h-[18px] w-[18px] transition-colors duration-200",
          isInFavorites 
            ? "fill-[#E53E3E] text-[#E53E3E]" 
            : "fill-transparent text-[#666666]"
        )}
      />
    </button>
  )
}
