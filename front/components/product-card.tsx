// front/components/product-card.tsx
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/api/products"
import { FavoriteButton } from "@/components/favorite-button"

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  // Берем первое изображение или главное
  const imageUrl = product.images[0]?.image_url || product.main_image

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F0F0F0]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        )}
        
        {/* Favorite Button Overlay */}
        <div 
          className="absolute right-3 top-3 z-10"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <FavoriteButton productId={product.id.toString()} />
        </div>

        {/* Stock Badge — shown only when stock tracking is active (total_stock > 0 means 1C tracks inventory) */}
        {/* TODO: enable when 1C inventory tracking is configured */}
      </div>

      {/* Product Info */}
      <div className="mt-4">
        <h3 className="text-[15px] font-medium text-[#1A1A1A] line-clamp-2">
          {product.name}
        </h3>
        
        {product.article && (
          <p className="mt-1 text-[12px] text-[#999999]">
            Артикул: {product.article}
          </p>
        )}
        
        <p className="mt-2 text-[16px] font-medium text-black">
          {new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
          }).format(product.price)}
        </p>
      </div>
    </div>
  )
}
