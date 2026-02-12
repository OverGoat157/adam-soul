"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { logout, user } = useAuth()

  const isAdmin = user === "admin"

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      {/* User Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0E0] bg-transparent transition-all duration-200 hover:border-black hover:bg-[#F5F5F5]"
        aria-label="Меню пользователя"
      >
        <User className="h-5 w-5 text-[#666666]" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-[52px] z-[1000] w-[200px] rounded-lg border border-[#E0E0E0] bg-white p-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          {/* Admin Panel Link - only for admin */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-4 py-3 text-left text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5]"
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </Link>
          )}

          {/* Divider */}
          {isAdmin && (
            <div className="my-1 border-t border-[#E0E0E0]" />
          )}

          <button
            onClick={() => {
              setIsOpen(false)
              logout()
            }}
            className="flex w-full items-center gap-2 rounded-md px-4 py-3 text-left text-sm font-medium text-[#E53E3E] transition-colors hover:bg-[#FFF5F5]"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}
