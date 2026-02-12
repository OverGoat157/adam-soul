import { Check, Star, Zap, Package, Shirt, Truck } from "lucide-react"

const benefits = [
  {
    icon: Package,
    title: "Малый опт от 3 изделий",
    description: "Начните работу с минимальными вложениями и оплатой в рассрочку"
  },
  {
    icon: Star,
    title: "Качественная фурнитура",
    description: "Эксклюзивные материалы от ведущих производителей"
  },
  {
    icon: Check,
    title: "Полный подгон клетки",
    description: "Идеальное совпадение рисунка по всем элементам изделия"
  },
  {
    icon: Shirt,
    title: "Все размеры и роста",
    description: "От 46 до 68 размера, роста от 170 до 200 см"
  },
  {
    icon: Zap,
    title: "Пошив под вашим брендом",
    description: "Создадим изделия с логотипом вашего магазина"
  },
  {
    icon: Truck,
    title: "Быстрая доставка",
    description: "Доставка по всей России в кратчайшие сроки"
  }
]

export function HorizontalBenefits() {
  return (
    <section id="benefits" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[4px] text-[#999999]">
            Преимущества
          </p>
          <h2 className="text-3xl md:text-[42px] font-light text-[#1A1A1A] leading-tight tracking-tight">
            Почему выбирают нас
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="group bg-[#F2F2F2] p-10 md:p-12 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
              >
                <Icon
                  className="mb-8 h-10 w-10 text-[#1A1A1A] transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1}
                />
                <h3 className="mb-4 text-xl font-semibold text-[#1A1A1A] tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-[15px] leading-[1.7] text-[#666666] font-light">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
