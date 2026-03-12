"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/api/products"

const PAGE_SIZE = 12

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Сбрасываем при смене списка товаров
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [products])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length))
  }, [products.length])

  // IntersectionObserver для подгрузки при прокрутке
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: "400px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (products.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-[#999999] text-lg font-light">Товары не найдены</p>
      </div>
    )
  }

  const visibleProducts = products.slice(0, visibleCount)
  const hasMore = visibleCount < products.length

  return (
    <>
      <div className="grid grid-cols-1 gap-5 px-1 sm:grid-cols-2 sm:gap-6 md:gap-10 lg:grid-cols-3 lg:px-0">
        {visibleProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(index, PAGE_SIZE - 1) * 80}ms` }}
          >
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E0E0E0] border-t-black" />
        </div>
      )}
    </>
  )
}
