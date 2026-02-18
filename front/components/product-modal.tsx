// front/components/product-modal.tsx
"use client"

import React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
        if (isDropdownOpen) {
          setIsDropdownOpen(false)
        } else if (open) {
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
  }, [open, onOpenChange, selectedImage, product, zoomOpen, isDropdownOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedImage(0)
      setSelectedSize(null)
      setZoomOpen(false)
      setIsDropdownOpen(false)
    }
  }, [open])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])

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
          "fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 md:p-8 transition-opacity duration-300",
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
            "relative z-[10000] m-auto w-full max-w-[1100px] transition-all duration-500 ease-out",
            isVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white shadow-[0_32px_80px_rgba(0,0,0,0.25)]">
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center bg-white text-[#666666] shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-black hover:text-white md:right-6 md:top-6"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Left Column - Main Image + Thumbnails Below */}
              <div className="relative flex flex-col bg-[#F8F8F8] p-5 lg:w-[55%] lg:p-8">
                {/* Main Image */}
                <div
                  className="relative aspect-[3/4] max-h-[60vh] cursor-zoom-in overflow-hidden bg-[#F0F0F0] lg:max-h-[70vh]"
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
              <div className="relative max-h-[50vh] overflow-y-auto p-6 lg:w-[45%] lg:max-h-[85vh] lg:p-10 lg:pl-8 scrollbar-hide">
                {/* Article */}
                <p className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                  Артикул: {product.article}
                </p>

                {/* Name with Favorite Button */}
                <div className="mb-6 flex items-start gap-4">
                  <h2
                    id="modal-title"
                    className="flex-1 text-[26px] md:text-[32px] font-light leading-tight tracking-tight text-[#1A1A1A]"
                  >
                    {product.name}
                  </h2>
                  <FavoriteButton
                    productId={product.id.toString()}
                    className="mt-1"
                  />
                </div>

                {/* Price */}
                <p className="mb-10 text-[36px] md:text-[42px] font-light text-black tracking-tight">
                  {formatPrice(product.price)}
                </p>

                {/* Size Selector - Custom Premium Dropdown */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-10">
                    <p className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                      Размер
                    </p>

                    <div className="relative" data-dropdown>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={cn(
                          "flex h-14 w-full items-center justify-between bg-[#F8F8F8] px-5 text-left transition-all duration-300",
                          isDropdownOpen && "bg-[#F0F0F0]",
                          selectedSize && "bg-white border border-black"
                        )}
                      >
                        <span className={cn(
                          "text-[15px]",
                          selectedSize ? "text-[#1A1A1A] font-medium" : "text-[#999999]"
                        )}>
                          {selectedSize ? `Размер ${selectedSize}` : "Выберите размер"}
                        </span>
                        <ChevronRight className={cn(
                          "h-5 w-5 text-[#999999] transition-transform duration-300",
                          isDropdownOpen && "rotate-90"
                        )} />
                      </button>

                      {/* Dropdown Menu */}
                      <div className={cn(
                        "absolute left-0 right-0 top-full z-20 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 origin-top",
                        isDropdownOpen
                          ? "opacity-100 scale-y-100 translate-y-0"
                          : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                      )}>
                        <div className="max-h-[280px] overflow-y-auto scrollbar-hide">
                          {product.sizes.filter(s => s.stock > 0).map((sizeItem) => (
                            <button
                              key={sizeItem.size}
                              onClick={() => {
                                setSelectedSize(sizeItem.size)
                                setIsDropdownOpen(false)
                              }}
                              className={cn(
                                "flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-200 hover:bg-[#F8F8F8]",
                                selectedSize === sizeItem.size && "bg-[#F8F8F8]"
                              )}
                            >
                              <span className="text-[15px] font-medium text-[#1A1A1A]">
                                {sizeItem.size}
                              </span>
                              {selectedSize === sizeItem.size && (
                                <Check className="h-4 w-4 text-black" strokeWidth={2} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div className="border-t border-[#F0F0F0] pt-8">
                    <p className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                      Описание
                    </p>
                    <p className="text-[15px] leading-[1.8] text-[#666666] font-light">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#F0F0F0] pt-8">
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
