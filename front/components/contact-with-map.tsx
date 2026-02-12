import { MessageCircle, Phone, Mail, MapPin } from "lucide-react"

export function ContactWithMap() {
  return (
    <section id="contacts" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[4px] text-[#999999]">
            Связаться с нами
          </p>
          <h2 className="text-3xl md:text-[42px] font-light text-[#1A1A1A] leading-tight tracking-tight">
            Контакты
          </h2>
        </div>

        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
          {/* Left Column - Map */}
          <div>
            <div className="overflow-hidden bg-[#F5F5F5]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2244.397236261988!2d37.60977!3d55.759811!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a50b315e573%3A0xa886bf5a3d9b2e68!2z0JzQvtGB0LrQstCwLCDQoNC-0YHRgdC40Y8!5e0!3m2!1sru!2sru!4v1704067200000!5m2!1sru!2sru"
                width="100%"
                height="350"
                style={{ border: 0, filter: 'grayscale(100%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="md:h-[450px]"
                title="AdamSoul Office Location"
              />
            </div>
            <p className="mt-6 text-center text-[12px] font-medium uppercase tracking-[3px] text-[#999999]">
              Мы работаем по всей России
            </p>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-10">
            {/* Phone Block */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-5 h-5 text-[#999999]" strokeWidth={1.5} />
                <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                  Телефон
                </p>
              </div>
              <div className="space-y-4 pl-0 md:pl-8">
                <div>
                  <a
                    href="tel:+78007751697"
                    className="text-lg md:text-2xl font-light text-[#1A1A1A] transition-colors hover:text-[#666666]"
                  >
                    +7 (800) 775-16-97
                  </a>
                  <p className="text-[11px] text-[#999999] mt-1">Звонок бесплатный</p>
                </div>
                <div>
                  <a
                    href="tel:+74959848335"
                    className="text-lg md:text-2xl font-light text-[#1A1A1A] transition-colors hover:text-[#666666]"
                  >
                    +7 (495) 984-83-35
                  </a>
                </div>
                <div>
                  <a
                    href="tel:+79652794111"
                    className="text-lg md:text-2xl font-light text-[#1A1A1A] transition-colors hover:text-[#666666]"
                  >
                    +7 (965) 279-41-11
                  </a>
                  <p className="text-[11px] text-[#999999] mt-1">WhatsApp / Telegram</p>
                </div>
              </div>
            </div>

            {/* Email Block */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-[#999999]" strokeWidth={1.5} />
                <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                  Email
                </p>
              </div>
              <a
                href="mailto:info@adamsoul.ru"
                className="pl-0 md:pl-8 text-base md:text-xl font-light text-[#1A1A1A] transition-colors hover:text-[#666666]"
              >
                info@adamsoul.ru
              </a>
            </div>

            {/* Address Block */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-[#999999]" strokeWidth={1.5} />
                <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                  Адрес
                </p>
              </div>
              <p className="pl-0 md:pl-8 text-[15px] md:text-[16px] leading-relaxed text-[#666666] font-light">
                Москва, Остаповский проезд, 5/1с1, БЦ Контакт
              </p>
            </div>

            {/* WhatsApp Button */}
            <div className="pt-4">
              <a
                href="https://wa.me/79652794111"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 md:gap-3 bg-[#25D366] px-6 md:px-8 py-3 md:py-4 text-[12px] md:text-[13px] font-semibold text-white uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)] w-full md:w-auto"
              >
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
