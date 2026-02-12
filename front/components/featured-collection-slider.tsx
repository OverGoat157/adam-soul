"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeaturedItem {
  id: number
  title: string
  subtitle: string
  image: string
}

const featuredItems: FeaturedItem[] = [
  {
    id: 1,
    title: "Пальто",
    subtitle: "Оптом от производителя",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200&q=80"
  },
  {
    id: 2,
    title: "Костюмы",
    subtitle: "Премиум класса",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80"
  },
  {
    id: 3,
    title: "Рубашки",
    subtitle: "Из итальянских тканей",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&q=80"
  },
  {
    id: 4,
    title: "Casual",
    subtitle: "Стиль и комфорт",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80"
  }
]

export function FeaturedCollectionSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length)
    setProgress(0)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide()
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isAutoPlaying, nextSlide])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
    setProgress(0)
  }

  return (
    <section className="bg-white py-10 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-12">
        {/* Section Header */}
        <div className="mb-6 md:mb-14">
          <p className="mb-2 md:mb-3 text-[10px] md:text-[11px] font-medium uppercase tracking-[3px] md:tracking-[4px] text-[#999999]">
            Коллекции
          </p>
          <h2 className="text-2xl md:text-[42px] font-light text-[#1A1A1A] leading-tight tracking-tight">
            Избранное
          </h2>
        </div>

        {/* Slider Container */}
        <div
          className="relative overflow-hidden rounded-sm"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative h-[50vh] min-h-[350px] max-h-[600px] md:h-[60vh] md:min-h-[450px] md:max-h-[700px] w-full">
        {featuredItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-out",
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            )}
          >
            <div className="relative h-full w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className={cn(
                  "object-cover object-center transition-transform duration-[8000ms] ease-out",
                  index === currentIndex && "scale-110"
                )}
                sizes="100vw"
                priority={index === 0}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

              <div className="absolute inset-0 flex items-center">
                <div className="w-full px-6 md:px-16 lg:px-24">
                  <div className="max-w-[600px]">
                    <p className="mb-2 md:mb-4 text-[10px] md:text-[11px] font-medium uppercase tracking-[3px] md:tracking-[4px] text-white/60">
                      Коллекция
                    </p>
                    <h2 className="mb-2 md:mb-4 text-3xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] tracking-tight">
                      {item.title}
                    </h2>
                    <p className="text-base md:text-2xl font-light text-white/80">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 md:h-14 md:w-14 -translate-y-1/2 items-center justify-center bg-white/10 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white hover:text-black md:left-10"
          aria-label="Предыдущий слайд"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 md:h-14 md:w-14 -translate-y-1/2 items-center justify-center bg-white/10 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white hover:text-black md:right-10"
          aria-label="Следующий слайд"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <div className="absolute bottom-6 md:bottom-12 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:gap-3 w-[180px] md:w-[240px]">
          {featuredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setProgress(0)
              }}
              className="flex-1 h-[2px] bg-white/20 overflow-hidden"
              aria-label={`Перейти к слайду ${index + 1}`}
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%'
                }}
              />
            </button>
          ))}
        </div>

        <div className="absolute bottom-6 md:bottom-12 right-6 md:right-10 z-10 hidden md:block">
          <span className="text-[13px] font-medium text-white/60 tabular-nums">
            {String(currentIndex + 1).padStart(2, '0')} / {String(featuredItems.length).padStart(2, '0')}
          </span>
        </div>
          </div>
        </div>
      </div>
    </section>
  )
}
