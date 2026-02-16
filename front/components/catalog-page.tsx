// front/components/catalog-page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { CategorySidebar } from "@/components/category-sidebar"
import { ProductGrid } from "@/components/product-grid"
import { ProductModal } from "@/components/product-modal"
import { Search, X } from "lucide-react"
import {
  getCategoriesByCollection,
  getProductsByCategory,
  type Product,
  type Category
} from "@/lib/api/products"
import { cn } from "@/lib/utils"

interface CatalogPageProps {
  collection: "classic" | "casual"
}

export function CatalogPage({ collection }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Debounce поискового запроса — 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    loadCategories()
  }, [collection])

  useEffect(() => {
    loadProducts()
  }, [collection, activeCategory, debouncedSearch])

  const loadCategories = async () => {
    try {
      const data = await getCategoriesByCollection(collection)
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProductsByCategory(collection, activeCategory, debouncedSearch || undefined)
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeCategoryName = useMemo(() => {
    if (activeCategory === 'all') return 'Все товары'
    const category = categories.find((c) => c.slug === activeCategory)
    return category?.name || "Все товары"
  }, [categories, activeCategory])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header activeCollection={collection} />
      
      <div className="flex min-h-[calc(100vh-80px)]">
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 transition-all duration-300">
          {/* Sticky поиск */}
          <div className="sticky top-[80px] z-20 bg-white border-b border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className={cn(
              "mx-auto max-w-[1200px] py-3 transition-all duration-300",
              sidebarOpen
                ? "px-6 md:px-10"
                : "px-6 md:pl-[68px] md:pr-[68px]"
            )}>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию или артикулу..."
                  className="w-full border border-[#E0E0E0] bg-white py-2 pl-9 pr-8 text-[13px] text-[#1A1A1A] placeholder-[#BBBBBB] outline-none focus:border-[#999999] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#1A1A1A] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "mx-auto max-w-[1200px] pb-16 transition-all duration-300",
              sidebarOpen
                ? "px-6 md:px-10"
                : "px-6 md:pl-[68px] md:pr-[68px]"
            )}
          >
            <div className="mb-10 mt-10 md:mb-12 md:mt-12">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[4px] text-[#999999]">
                Каталог
              </p>
              <h1 className="text-[32px] md:text-[38px] font-light text-[#1A1A1A] tracking-tight">
                {activeCategoryName}
              </h1>
              <p className="mt-3 text-[15px] text-[#666666]">
                {loading ? (
                  <span>Загрузка...</span>
                ) : (
                  <span>{products.length} {getProductsLabel(products.length)}</span>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E0E0E0] border-t-black" />
              </div>
            ) : (
              <ProductGrid products={products} onProductClick={handleProductClick} />
            )}
          </div>
        </main>
      </div>

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}

function getProductsLabel(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "товаров"
  }

  if (lastDigit === 1) {
    return "товар"
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "товара"
  }

  return "товаров"
}
