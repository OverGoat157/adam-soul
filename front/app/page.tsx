"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)

    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden flex flex-col">
      {/* Header - Logo + Catalog Button */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-20 transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : "bg-white/95 backdrop-blur-md"
      )}>
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 md:px-10">
          <Link href="/" className="text-2xl font-semibold tracking-tight transition-colors duration-300 text-black">
            Adam Soul
          </Link>

          <Link
            href="/login"
            className="px-6 py-2.5 text-[13px] font-semibold tracking-wide uppercase transition-all duration-300 bg-black text-white hover:bg-[#333333]"
          >
            Каталог
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {/* Collection Cards */}
        <section id="collections" className="bg-gradient-to-b from-white via-gray-50 to-white w-full">
          <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-16 lg:py-20">
            {/* Section Header */}
            <div className="text-center mb-10 md:mb-14 lg:mb-16">
              <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[4px] md:tracking-[6px] text-black/40 mb-4">
                Наши коллекции
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-black tracking-tight">
                Выберите категорию товаров
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 xl:gap-16">
              {/* Classic Collection Card */}
              <Link
                href="/login"
                className="group relative flex min-h-[350px] sm:min-h-[400px] md:min-h-0 md:aspect-[3/4] lg:aspect-[4/5] xl:aspect-[3/4] flex-col justify-end overflow-hidden transition-all duration-700 hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] rounded-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-opacity duration-700 group-hover:from-black/90" />
                <Image
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80"
                  alt="Classic Collection"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="relative z-20 p-6 sm:p-8 md:p-10 lg:p-12">
                  <span className="mb-2 md:mb-3 inline-block text-[9px] md:text-[10px] font-medium uppercase tracking-[3px] md:tracking-[5px] text-white/50">
                    Коллекция
                  </span>
                  <h2 className="mb-3 md:mb-4 lg:mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white tracking-tight">
                    Classic
                  </h2>
                  <span className="inline-flex items-center gap-2 md:gap-3 text-[11px] md:text-[12px] lg:text-[13px] font-semibold text-white uppercase tracking-[2px] border-b-2 border-white/0 group-hover:border-white/100 transition-all duration-300 pb-1">
                    Смотреть коллекцию
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </div>
              </Link>

              {/* Casual Collection Card */}
              <Link
                href="/login"
                className="group relative flex min-h-[350px] sm:min-h-[400px] md:min-h-0 md:aspect-[3/4] lg:aspect-[4/5] xl:aspect-[3/4] flex-col justify-end overflow-hidden transition-all duration-700 hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] rounded-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-opacity duration-700 group-hover:from-black/90" />
                <Image
                  src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80"
                  alt="Casual Collection"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="relative z-20 p-6 sm:p-8 md:p-10 lg:p-12">
                  <span className="mb-2 md:mb-3 inline-block text-[9px] md:text-[10px] font-medium uppercase tracking-[3px] md:tracking-[5px] text-white/50">
                    Коллекция
                  </span>
                  <h2 className="mb-3 md:mb-4 lg:mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white tracking-tight">
                    Casual
                  </h2>
                  <span className="inline-flex items-center gap-2 md:gap-3 text-[11px] md:text-[12px] lg:text-[13px] font-semibold text-white uppercase tracking-[2px] border-b-2 border-white/0 group-hover:border-white/100 transition-all duration-300 pb-1">
                    Смотреть коллекцию
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] py-12 md:py-16 mt-auto">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Left - Brand Info */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-3">
                Adam Soul
              </h3>
              <p className="text-[13px] md:text-[14px] text-white/50 font-light leading-relaxed">
                Премиальная мужская одежда для тех, кто ценит качество и стиль
              </p>
            </div>

            {/* Center - Social Links */}
            <div className="flex justify-center gap-4">
              <a
                href="https://wa.me/79652794111"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center border border-white/20 text-white/60 transition-all duration-300 hover:border-white/60 hover:text-white hover:bg-white/10 hover:scale-105"
                aria-label="WhatsApp"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="https://t.me/adamsoul"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center border border-white/20 text-white/60 transition-all duration-300 hover:border-white/60 hover:text-white hover:bg-white/10 hover:scale-105"
                aria-label="Telegram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a
                href="mailto:info@adamsoul.ru"
                className="flex h-11 w-11 items-center justify-center border border-white/20 text-white/60 transition-all duration-300 hover:border-white/60 hover:text-white hover:bg-white/10 hover:scale-105"
                aria-label="Email"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>

            {/* Right - Copyright */}
            <div className="text-center md:text-right">
              <p className="text-[11px] text-white/30 tracking-wide">
                © 2025 Adam Soul. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
