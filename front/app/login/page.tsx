"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuth()

  // Animation on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/catalog/classic")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const success = await login(username, password)

    if (success) {
      router.push("/catalog/classic")
    } else {
      setError("Неверный логин или пароль")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5F5F5]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E0E0E0] border-t-black" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8F8F8] via-white to-[#F0F0F0]" />

      {/* Decorative Elements */}
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-[#E8E8E8] to-transparent opacity-50 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-tl from-[#E8E8E8] to-transparent opacity-50 blur-3xl" />

      {/* Login Card */}
      <div
        className={`relative w-full max-w-[460px] bg-white px-6 py-10 md:px-12 md:py-14 shadow-[0_8px_60px_rgba(0,0,0,0.08)] transition-all duration-700 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {/* Logo */}
        <div className="mb-8 md:mb-10 text-center">
          <h1 className="text-[28px] md:text-[36px] font-light tracking-tight text-[#1A1A1A]">
            Adam Soul
          </h1>
          <p className="mt-2 text-[11px] md:text-[13px] font-medium uppercase tracking-[3px] md:tracking-[4px] text-[#999999]">
            Оптовый каталог
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-3 block text-[11px] font-medium uppercase tracking-[3px] text-[#999999]"
            >
              Логин
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 w-full border-0 border-b border-[#E0E0E0] bg-transparent px-0 text-[16px] text-[#1A1A1A] transition-all duration-300 placeholder:text-[#CCCCCC] focus:border-black focus:outline-none"
              placeholder="Введите логин"
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-3 block text-[11px] font-medium uppercase tracking-[3px] text-[#999999]"
            >
              Пароль
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full border-0 border-b border-[#E0E0E0] bg-transparent px-0 pr-12 text-[16px] text-[#1A1A1A] transition-all duration-300 placeholder:text-[#CCCCCC] focus:border-black focus:outline-none"
                placeholder="Введите пароль"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#999999] transition-colors duration-300 hover:text-[#1A1A1A]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#DC2626]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="relative mt-8 h-14 w-full overflow-hidden bg-black text-[13px] font-medium uppercase tracking-[3px] text-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <span className={`transition-opacity duration-300 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
              Войти
            </span>
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            )}
          </button>
        </form>

        {/* Back to Homepage */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[13px] text-[#999999] transition-colors duration-300 hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />
            <span>На главную</span>
          </Link>
        </div>

        {/* Decorative Line */}
        <div className="absolute bottom-0 left-1/2 h-1 w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#E0E0E0] to-transparent" />
      </div>
    </div>
  )
}
