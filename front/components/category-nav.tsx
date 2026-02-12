"use client"

import { cn } from "@/lib/utils"
import type { Category } from "@/lib/data"

interface CategoryNavProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (slug: string) => void
}

export function CategoryNav({ categories, activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="border-b border-[#E0E0E0] bg-white">
      <div className="mx-auto max-w-[1400px] px-6 py-5 md:px-10">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="flex gap-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  "px-6 py-3 rounded-full text-[15px] font-medium transition-all duration-200 whitespace-nowrap",
                  activeCategory === category.slug
                    ? "bg-black text-white"
                    : "bg-transparent text-[#666666] hover:bg-[#F5F5F5]"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
