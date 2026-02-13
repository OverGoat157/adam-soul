"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ArrowLeft } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { getProducts } from "@/lib/api/products"
import type { Product } from "@/lib/api/products"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { ProductModal } from "@/components/product-modal"

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const { isLoading } = useAuth()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getProducts().then(setAllProducts).catch(() => setAllProducts([]))
  }, [])

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id.toString()))

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E0E0E0] border-t-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
        {/* Back Button */}
        <Link
          href="/catalog/classic"
          className="group mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#999999] transition-colors duration-300 hover:text-[#1A1A1A]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />
          Вернуться в каталог
        </Link>

        {/* Page Header */}
        <div className="mb-12">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[4px] text-[#999999]">
            Ваши товары
          </p>
          <h1 className="text-[36px] md:text-[42px] font-light text-[#1A1A1A] tracking-tight">
            Избранное
          </h1>
          {favoriteProducts.length > 0 && (
            <p className="mt-3 text-[15px] text-[#666666]">
              {favoriteProducts.length} {favoriteProducts.length === 1 ? "товар" : favoriteProducts.length < 5 ? "товара" : "товаров"} в избранном
            </p>
          )}
        </div>

        {/* Content */}
        {favoriteProducts.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center bg-[#F8F8F8]">
              <Heart className="h-10 w-10 text-[#CCCCCC]" strokeWidth={1} />
            </div>
            <h2 className="mb-3 text-xl font-light text-[#1A1A1A]">
              В избранном пока ничего нет
            </h2>
            <p className="mb-8 max-w-[320px] text-[15px] text-[#999999] font-light">
              Добавляйте понравившиеся товары, чтобы не потерять их
            </p>
            <Link
              href="/catalog/classic"
              className="bg-black px-8 py-4 text-[13px] font-medium uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 md:gap-10">
            {favoriteProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <ProductCard
                  product={product}
                  onClick={() => {
                    setSelectedProduct(product)
                    setModalOpen(true)
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setSelectedProduct(null)
          }
        }}
      />
    </div>
  )
}
