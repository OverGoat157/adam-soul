"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"

export function FavoritesIcon() {
  const { favoritesCount } = useFavorites()

  return (
    <Link
      href="/favorites"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0E0] bg-transparent transition-all duration-200 hover:border-black hover:bg-[#F5F5F5]"
      aria-label={`Избранное (${favoritesCount} товаров)`}
    >
      <Heart className="h-5 w-5 text-[#666666]" />
      
      {/* Badge */}
      {favoritesCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
          {favoritesCount > 99 ? "99+" : favoritesCount}
        </span>
      )}
    </Link>
  )
}
