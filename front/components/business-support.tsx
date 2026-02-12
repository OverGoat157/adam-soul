import { Globe, BarChart3, Shield, FileText } from "lucide-react"

const supportItems = [
  {
    icon: Globe,
    title: "SMM продвижение",
    description: "Мы предоставляем вам фото-видео контент для продвижения в соц.сетях, а также необходимые инструкции по настройке рекламных кампаний"
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    description: "Учим вас правильно анализировать ваши показатели, даём грамотные консультации и советы для увеличения прибыли"
  },
  {
    icon: Shield,
    title: "Защита от конкуренции",
    description: "Прежде чем заключить договор и начать работать с новым контрагентом, мы проводим анализ. Если выяснится, что местоположение его магазина может негативно сказаться на успехе торговли наших ныне действующих партнеров, мы откажем"
  },
  {
    icon: FileText,
    title: "Полный пакет документов",
    description: "Приобретая товар, вы получаете полный пакет документов: договор поставки, счёт, торг-12, декларация соответствия — всё для беспрепятственной продажи"
  }
]

export function BusinessSupport() {
  return (
    <section id="support" className="bg-[#F5F5F5] py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[4px] text-[#999999]">
            Поддержка бизнеса
          </p>
          <h2 className="mb-6 text-3xl md:text-[42px] font-light text-[#1A1A1A] leading-tight tracking-tight">
            Наша поддержка
          </h2>
          <p className="mx-auto max-w-[500px] text-[16px] text-[#666666] font-light leading-relaxed">
            Мы не просто поставщик, а надёжный партнёр в развитии вашего бизнеса
          </p>
        </div>

        {/* Support Cards */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {supportItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="group bg-white p-10 md:p-12 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
              >
                <Icon
                  className="mb-8 h-10 w-10 text-[#1A1A1A] transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1}
                />
                <h3 className="mb-4 text-xl font-semibold text-[#1A1A1A] tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-[1.7] text-[#666666] font-light">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
