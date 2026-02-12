"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqItems = [
  {
    question: "Какой минимальный объем заказа?",
    answer: "Минимальный заказ составляет 3 изделия. Также доступна оплата в рассрочку — 4 равных платежа в течение месяца после заказа."
  },
  {
    question: "Как доставляется товар?",
    answer: "Мы работаем со всеми транспортными компаниями России. Доставка осуществляется по всей стране. Сроки доставки зависят от региона — обычно 3-7 дней."
  },
  {
    question: "Можно ли заказать пошив под собственным брендом?",
    answer: "Да, мы фабрика и можем изготовить изделия с брендом вашего магазина. Срок выполнения предзаказа — 3 недели."
  },
  {
    question: "Можно ли в моем городе торговать только одному?",
    answer: "Мы проводим анализ перед началом сотрудничества. Если новый контрагент может негативно повлиять на бизнес наших действующих партнеров в этом регионе, мы можем отказать в сотрудничестве."
  },
  {
    question: "Какие размеры доступны для заказа?",
    answer: "Мы производим все размеры с 46 по 68, во всех ростах от 170 до 200 см. Также шьём изделия разной длины — от короткой до удлинённой серии."
  },
  {
    question: "Работаете ли вы с маркировкой?",
    answer: "Да, мы предоставляем полный пакет документов: договор поставки, счёт, торг-12, декларацию соответствия. Это позволяет вам легально продавать товар без проблем с контролирующими органами."
  }
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="bg-[#F5F5F5] py-24 md:py-32">
      <div className="mx-auto max-w-[900px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[4px] text-[#999999]">
            FAQ
          </p>
          <h2 className="text-3xl md:text-[42px] font-light text-[#1A1A1A] leading-tight tracking-tight">
            Вопросы и ответы
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="bg-white overflow-hidden transition-all duration-500"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between p-6 md:p-8 text-left transition-colors hover:bg-[#F5F5F5]"
                >
                  <span className="pr-8 text-[16px] md:text-[17px] font-medium text-[#1A1A1A]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-[#999999] transition-transform duration-300 flex-shrink-0",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-out",
                    isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="px-6 pb-6 md:px-8 md:pb-8 text-[15px] leading-[1.8] text-[#666666] font-light">
                    {item.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
