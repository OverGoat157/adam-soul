"use client"

import { useRef } from "react"
import Image from "next/image"

const partners = [
  {
    handle: "@novikovstyle",
    posts: "1,167",
    followers: "296 т.",
    description: "Мужские костюмы премиум класса",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
  },
  {
    handle: "@elitemen_",
    posts: "1,859",
    followers: "56,9 т.",
    description: "Стильная мужская одежда",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
  },
  {
    handle: "@provokatorgroup",
    posts: "601",
    followers: "38,8 т.",
    description: "Костюмы и классика для мужчин",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
  },
  {
    handle: "@evs.mens",
    posts: "250",
    followers: "89,7 т.",
    description: "Мужская мода и стиль",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80"
  },
  {
    handle: "@mensuit_moscow",
    posts: "432",
    followers: "45,2 т.",
    description: "Костюмы на заказ в Москве",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
  }
]

export function PartnersShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className="bg-[#0A0A0A] py-24 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-20 px-4 md:px-12">
          <p className="mb-3 md:mb-4 text-[10px] md:text-[11px] font-medium uppercase tracking-[3px] md:tracking-[4px] text-white/40">
            Наши партнёры
          </p>
          <h2 className="mb-4 md:mb-6 text-xl md:text-[36px] font-light text-white leading-tight tracking-tight max-w-[700px] mx-auto">
            Аккаунты в соц.сетях наших партнеров
          </h2>
          <p className="text-[13px] md:text-[15px] text-white/60 font-light">
            С нами работает более 250 магазинов мужской одежды
          </p>
        </div>

        {/* Partners Scroll */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 md:gap-6 overflow-x-auto px-4 md:px-12 pb-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group flex min-w-[220px] md:min-w-[280px] flex-shrink-0 flex-col items-center p-6 md:p-8 bg-[#111111] border border-[#1A1A1A] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Avatar with gradient border */}
              <div className="relative mb-4 md:mb-6 p-[2px] bg-gradient-to-b from-white/30 to-white/10 rounded-full">
                <div className="relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full bg-[#0A0A0A]">
                  <Image
                    src={partner.image || "/placeholder.svg"}
                    alt={partner.handle}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </div>

              <p className="mb-2 md:mb-3 text-[14px] md:text-[15px] font-semibold text-white">
                {partner.handle}
              </p>

              <div className="mb-3 md:mb-4 flex gap-4 md:gap-6 text-[12px] md:text-[13px] text-white/50">
                <span>{partner.posts} публ.</span>
                <span>{partner.followers}</span>
              </div>

              <p className="text-center text-[12px] md:text-[13px] leading-relaxed text-white/40 font-light">
                {partner.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-10 md:mt-16 px-4 md:px-12 text-center">
          <a
            href="https://wa.me/79652794111"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white px-8 md:px-10 py-3 md:py-4 text-[12px] md:text-[13px] font-semibold text-black uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]"
          >
            Стать партнёром
          </a>
        </div>
      </div>
    </section>
  )
}
