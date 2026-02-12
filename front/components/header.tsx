"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FavoritesIcon } from "@/components/favorites-icon"
import { UserMenu } from "@/components/user-menu"

interface HeaderProps {
  activeCollection?: "classic" | "casual"
}

export function Header({ activeCollection }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-20 bg-white/95 backdrop-blur-md border-b border-[#F0F0F0] transition-all duration-300",
        isScrolled && "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      )}
    >
      <div className="mx-auto h-full max-w-[1400px] flex items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="text-2xl font-semibold text-[#1A1A1A] tracking-tight transition-opacity hover:opacity-70">
          Adam Soul
        </Link>

        {/* Center Navigation */}
        {activeCollection && (
          <nav className="hidden md:flex items-center gap-12">
            <Link
              href="/catalog/classic"
              className={cn(
                "relative text-[14px] font-medium tracking-wide transition-colors",
                activeCollection === "classic"
                  ? "text-[#1A1A1A]"
                  : "text-[#999999] hover:text-[#1A1A1A]"
              )}
            >
              Classic
              <span className={cn(
                "absolute -bottom-1 left-0 h-[1px] bg-black transition-all duration-300",
                activeCollection === "classic" ? "w-full" : "w-0"
              )} />
            </Link>
            <Link
              href="/catalog/casual"
              className={cn(
                "relative text-[14px] font-medium tracking-wide transition-colors",
                activeCollection === "casual"
                  ? "text-[#1A1A1A]"
                  : "text-[#999999] hover:text-[#1A1A1A]"
              )}
            >
              Casual
              <span className={cn(
                "absolute -bottom-1 left-0 h-[1px] bg-black transition-all duration-300",
                activeCollection === "casual" ? "w-full" : "w-0"
              )} />
            </Link>
          </nav>
        )}

        {/* Right Side - User Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          <FavoritesIcon />
          <UserMenu />

          {/* Mobile Menu Button */}
          {activeCollection && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center md:hidden"
              aria-label="Меню"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-[#1A1A1A]" />
              ) : (
                <Menu className="h-5 w-5 text-[#1A1A1A]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {activeCollection && (
        <div className={cn(
          "absolute left-0 top-20 w-full bg-white border-b border-[#F0F0F0] shadow-lg md:hidden transition-all duration-300 overflow-hidden",
          mobileMenuOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <nav className="flex flex-col px-6 py-4">
            <Link
              href="/catalog/classic"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "py-3 text-[15px] font-medium transition-colors border-b border-[#F0F0F0]",
                activeCollection === "classic"
                  ? "text-[#1A1A1A]"
                  : "text-[#999999]"
              )}
            >
              Classic
            </Link>
            <Link
              href="/catalog/casual"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "py-3 text-[15px] font-medium transition-colors",
                activeCollection === "casual"
                  ? "text-[#1A1A1A]"
                  : "text-[#999999]"
              )}
            >
              Casual
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
