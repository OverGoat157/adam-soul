"use client"

import React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageZoomModalProps {
  images: string[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageChange: (index: number) => void
}

export function ImageZoomModal({
  images,
  currentIndex,
  open,
  onOpenChange,
  onImageChange,
}: ImageZoomModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Animation on open
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
    }
  }, [open])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "Escape":
          onOpenChange(false)
          break
        case "ArrowLeft":
          if (currentIndex > 0) {
            onImageChange(currentIndex - 1)
          }
          break
        case "ArrowRight":
          if (currentIndex < images.length - 1) {
            onImageChange(currentIndex + 1)
          }
          break
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, currentIndex, images.length, onOpenChange, onImageChange])

  if (!open) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < images.length - 1

  return (
    <div
      className={cn(
        "fixed inset-0 z-[19998] flex items-center justify-center p-2 sm:p-5 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Увеличенное изображение"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-500",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />

      {/* Close Button - Square style */}
      <button
        onClick={() => onOpenChange(false)}
        className="fixed right-2 top-2 z-[20000] flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center bg-white text-[#666666] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-black hover:text-white sm:right-5 sm:top-5"
        aria-label="Закрыть"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Navigation Arrows - Square style */}
      {canGoPrev && (
        <button
          onClick={() => onImageChange(currentIndex - 1)}
          className="fixed left-1 top-1/2 z-[20000] flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white sm:left-5 sm:h-12 sm:w-12 md:left-8 md:h-14 md:w-14"
          aria-label="Предыдущее изображение"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
        </button>
      )}

      {canGoNext && (
        <button
          onClick={() => onImageChange(currentIndex + 1)}
          className="fixed right-1 top-1/2 z-[20000] flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white sm:right-5 sm:h-12 sm:w-12 md:right-8 md:h-14 md:w-14"
          aria-label="Следующее изображение"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
        </button>
      )}

      {/* Image Container */}
      <div
        className={cn(
          "relative z-[19999] h-[90vh] w-[96vw] sm:w-[90vw] sm:max-w-[900px] transition-all duration-500 ease-out",
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Изображение ${currentIndex + 1} из ${images.length}`}
          fill
          className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          sizes="(max-width: 640px) 96vw, 90vw"
          priority
        />
      </div>

      {/* Image Counter - Square style */}
      <div className="fixed bottom-5 left-1/2 z-[20000] -translate-x-1/2 bg-white/90 px-4 py-2 text-[12px] font-medium tracking-wide text-[#666666]">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
