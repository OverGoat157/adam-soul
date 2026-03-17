"use client"

import { ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/api/products"

interface CategorySidebarProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (slug: string) => void
  sidebarKeyword?: string | null
  onKeywordChange?: (keyword: string | null) => void
  collection?: string
  isOpen: boolean
  onToggle: () => void
}

export function CategorySidebar({
  categories,
  activeCategory,
  onCategoryChange,
  sidebarKeyword,
  onKeywordChange,
  collection,
  isOpen,
  onToggle,
}: CategorySidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[1000] h-screen bg-white border-r border-[#F0F0F0] transition-all duration-500 ease-out",
          "md:sticky md:top-20 md:z-50 md:h-[calc(100vh-80px)] md:flex-shrink-0",
          isOpen
            ? "w-[280px] translate-x-0 md:w-[260px]"
            : "-translate-x-full md:translate-x-0 md:w-0"
        )}
      >
        <div className={cn(
          "h-full overflow-y-auto overflow-x-hidden transition-opacity duration-300 scrollbar-hide",
          isOpen ? "opacity-100 w-[280px] md:w-[260px]" : "opacity-0 w-0"
        )}>
          <div className="p-8 pt-10">
            <p className="mb-8 text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
              Категории
            </p>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onCategoryChange("all")
                  if (window.innerWidth < 768) {
                    onToggle()
                  }
                }}
                className={cn(
                  "w-full py-3 text-left text-[15px] font-medium transition-all duration-300 whitespace-nowrap",
                  activeCategory === "all" && !sidebarKeyword
                    ? "text-[#1A1A1A]"
                    : "text-[#999999] hover:text-[#1A1A1A]"
                )}
              >
                <span className={cn(
                  "relative pb-1",
                  activeCategory === "all" && !sidebarKeyword && "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black"
                )}>
                  Все товары
                </span>
              </button>

              {collection === "classic" && (
                <button
                  onClick={() => {
                    onKeywordChange?.("Смокинг")
                    if (window.innerWidth < 768) {
                      onToggle()
                    }
                  }}
                  className={cn(
                    "w-full py-3 text-left text-[15px] font-medium transition-all duration-300 whitespace-nowrap",
                    sidebarKeyword === "Смокинг"
                      ? "text-[#1A1A1A]"
                      : "text-[#999999] hover:text-[#1A1A1A]"
                  )}
                >
                  <span className={cn(
                    "relative pb-1",
                    sidebarKeyword === "Смокинг" && "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black"
                  )}>
                    Смокинги
                  </span>
                </button>
              )}

              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => {
                    onCategoryChange(category.slug)
                    if (window.innerWidth < 768) {
                      onToggle()
                    }
                  }}
                  className={cn(
                    "w-full py-3 text-left text-[15px] font-medium transition-all duration-300 whitespace-nowrap",
                    activeCategory === category.slug && !sidebarKeyword
                      ? "text-[#1A1A1A]"
                      : "text-[#999999] hover:text-[#1A1A1A]"
                  )}
                >
                  <span className={cn(
                    "relative pb-1",
                    activeCategory === category.slug && !sidebarKeyword && "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black"
                  )}>
                    {category.name}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Toggle Button — mobile: bottom-left arrow, desktop: top-left */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed z-[1001] flex items-center justify-center bg-white border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-500 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
          // Mobile: bottom-left round pill
          "bottom-6 left-3 h-10 w-10 rounded-full md:rounded-none",
          // Desktop: top-left square
          "md:bottom-auto md:top-[100px] md:h-11 md:w-11",
          isOpen
            ? "left-[272px] md:left-[272px]"
            : "left-3 md:left-4"
        )}
        aria-label={isOpen ? "Скрыть категории" : "Показать категории"}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-[#666666]" />
        ) : (
          <ChevronRight className="h-5 w-5 text-[#666666]" />
        )}
      </button>
    </>
  )
}
