// front/components/catalog-page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { CategorySidebar } from "@/components/category-sidebar"
import { ProductGrid } from "@/components/product-grid"
import { ProductModal } from "@/components/product-modal"
import { 
  getCategoriesByCollection, 
  getProductsByCategory, 
  type Product, 
  type Category 
} from "@/lib/api/products" // Изменено - теперь из api/products
import { cn } from "@/lib/utils"

interface CatalogPageProps {
  collection: "classic" | "casual"
}

export function CatalogPage({ collection }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [collection])

  useEffect(() => {
    loadProducts()
  }, [collection, activeCategory])

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
      const data = await getProductsByCategory(collection, activeCategory)
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
          <div 
            className={cn(
              "mx-auto max-w-[1200px] pb-16 transition-all duration-300",
              sidebarOpen 
                ? "px-6 md:px-10" 
                : "px-6 md:pl-[68px] md:pr-[68px]"
            )}
          >
            <div className="mb-10 mt-14 md:mb-12 md:mt-16">
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
