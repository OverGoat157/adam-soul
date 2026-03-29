// front/components/product-modal.tsx
"use client"

import React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/api/products"
import { ImageZoomModal } from "@/components/image-zoom-modal"
import { FavoriteButton } from "@/components/favorite-button"

interface ProductModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Утилита для форматирования цены
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
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

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomOpen) return

      if (e.key === "Escape") {
        if (open) {
          onOpenChange(false)
        }
      }
      if (e.key === "ArrowLeft" && open && product && selectedImage > 0) {
        setSelectedImage(selectedImage - 1)
      }
      if (e.key === "ArrowRight" && open && product && selectedImage < product.images.length - 1) {
        setSelectedImage(selectedImage + 1)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange, selectedImage, product, zoomOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedImage(0)
      setZoomOpen(false)
    }
  }, [open])

  if (!product || !open) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const canGoPrev = selectedImage > 0
  const canGoNext = selectedImage < product.images.length - 1

  // Извлекаем URLs из объектов изображений
  const imageUrls = product.images.map(img => img.image_url)
  const currentImageUrl = product.images[selectedImage]?.image_url || product.main_image

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-0 sm:p-4 md:p-8 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          className={cn(
            "relative z-[10000] m-auto w-full max-w-[1100px] h-full sm:h-auto transition-all duration-500 ease-out",
            isVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white shadow-[0_32px_80px_rgba(0,0,0,0.25)] h-full sm:h-auto overflow-y-auto sm:overflow-visible">
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center bg-white text-[#666666] shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-black hover:text-white sm:right-4 sm:top-4 sm:h-12 sm:w-12 md:right-6 md:top-6"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Left Column - Main Image + Thumbnails Below */}
              <div className="relative flex flex-col bg-[#F8F8F8] p-2 sm:p-5 lg:w-[55%] lg:p-8">
                {/* Main Image */}
                <div
                  className="relative aspect-[3/4] max-h-[45vh] cursor-zoom-in overflow-hidden bg-[#F0F0F0] sm:max-h-[60vh] lg:max-h-[70vh]"
                  onClick={() => setZoomOpen(true)}
                >
                  <Image
                    src={currentImageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                  />

                  {/* Navigation Arrows */}
                  {canGoPrev && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(selectedImage - 1)
                      }}
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-[#1A1A1A] shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white lg:left-4 lg:h-12 lg:w-12"
                      aria-label="Предыдущее изображение"
                    >
                      <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={1.5} />
                    </button>
                  )}

                  {canGoNext && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(selectedImage + 1)
                      }}
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-[#1A1A1A] shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white lg:right-4 lg:h-12 lg:w-12"
                      aria-label="Следующее изображение"
                    >
                      <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={1.5} />
                    </button>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-3 right-3 bg-white/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#666666] lg:bottom-4 lg:right-4 lg:px-3 lg:py-1.5 lg:text-[12px]">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                </div>

                {/* Horizontal Thumbnails Below Main Image */}
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:mt-4">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative h-[60px] w-[45px] flex-shrink-0 overflow-hidden transition-all duration-300 lg:h-[72px] lg:w-[54px]",
                        selectedImage === index
                          ? "ring-2 ring-black opacity-100"
                          : "opacity-50 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={image.image_url}
                        alt={`${product.name} - фото ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="54px"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column - Info */}
              <div className="relative overflow-y-auto p-4 sm:p-6 sm:max-h-[50vh] lg:w-[45%] lg:max-h-[85vh] lg:p-10 lg:pl-8 scrollbar-hide">
                {/* Article */}
                <p className="mb-2 sm:mb-4 text-[10px] sm:text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                  Артикул: {product.article}
                </p>

                {/* Name with Favorite Button */}
                <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
                  <h2
                    id="modal-title"
                    className="flex-1 text-[20px] sm:text-[26px] md:text-[32px] font-light leading-tight tracking-tight text-[#1A1A1A]"
                  >
                    {product.name}
                  </h2>
                  <FavoriteButton
                    productId={product.id.toString()}
                    className="mt-1"
                  />
                </div>

                {/* Price */}
                <p className="mb-6 sm:mb-10 text-[28px] sm:text-[36px] md:text-[42px] font-light text-black tracking-tight">
                  {formatPrice(product.price)}
                </p>

                {/* Size Grids - Оптовое отображение размерных сеток */}
                {product.size_grids && product.size_grids.length > 0 ? (
                  <div className="mb-6 sm:mb-10">
                    <p className="mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                      Наличие размеров
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.size_grids.map((grid) => {
                        const isRange = grid.includes('-')
                        return (
                          <span
                            key={grid}
                            className={cn(
                              "inline-flex items-center px-3 py-2 text-[14px] font-medium transition-colors",
                              isRange
                                ? "bg-black text-white"
                                : "bg-[#F0F0F0] text-[#1A1A1A]"
                            )}
                          >
                            {grid}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ) : product.sizes && product.sizes.filter(s => s.stock > 0).length > 0 ? (
                  <div className="mb-6 sm:mb-10">
                    <p className="mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                      Наличие размеров
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.filter(s => s.stock > 0).map((sizeItem) => (
                        <span
                          key={sizeItem.size}
                          className="inline-flex items-center px-3 py-2 text-[14px] font-medium bg-[#F0F0F0] text-[#1A1A1A]"
                        >
                          {sizeItem.size}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Description */}
                {product.description && (
                  <div className="border-t border-[#F0F0F0] pt-5 sm:pt-8">
                    <p className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                      Описание
                    </p>
                    <p className="text-[15px] leading-[1.8] text-[#666666] font-light">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-6 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-6 border-t border-[#F0F0F0] pt-6 sm:pt-8">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#999999] mb-2">
                      Доставка
                    </p>
                    <p className="text-[14px] text-[#1A1A1A]">
                      По всей России
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#999999] mb-2">
                      Оплата
                    </p>
                    <p className="text-[14px] text-[#1A1A1A]">
                      Рассрочка доступна
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        images={imageUrls}
        currentIndex={selectedImage}
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        onImageChange={setSelectedImage}
      />
    </>
  )
}
