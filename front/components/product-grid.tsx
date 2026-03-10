"use client"

import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/api/products"

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-[#999999] text-lg font-light">Товары не найдены</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 px-1 sm:grid-cols-2 sm:gap-6 md:gap-10 lg:grid-cols-3 lg:px-0">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <ProductCard
            product={product}
            onClick={() => onProductClick(product)}
          />
        </div>
      ))}
    </div>
  )
}
