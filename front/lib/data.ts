export interface ProductSize {
  size: string
  stock: number
}

export interface Product {
  id: string
  name: string
  article: string
  price: number
  category: string
  collection: 'classic' | 'casual'
  description: string
  images: string[]
  sizes: ProductSize[]
}

export interface Category {
  id: string
  name: string
  slug: string
}

// Classic Collection Categories (no "Все товары" - show all by default)
export const classicCategories: Category[] = [
  { id: 'suits', name: 'Костюмы-тройки', slug: 'suits' },
  { id: 'shirts', name: 'Рубашки', slug: 'shirts' },
  { id: 'coats', name: 'Пальто', slug: 'coats' },
  { id: 'vests', name: 'Жилеты', slug: 'vests' },
]

// Casual Collection Categories (no "Все товары" - show all by default)
export const casualCategories: Category[] = [
  { id: 'knitwear', name: 'Трикотаж', slug: 'knitwear' },
  { id: 'jeans', name: 'Джинсы', slug: 'jeans' },
  { id: 'jackets', name: 'Куртки', slug: 'jackets' },
  { id: 'polo', name: 'Поло', slug: 'polo' },
]

// Sample Products
export const products: Product[] = [
  // Classic Collection - Suits
  {
    id: '1',
    name: 'Костюм-тройка Classic Charcoal',
    article: 'AS-S001',
    price: 45900,
    category: 'suits',
    collection: 'classic',
    description: 'Классический костюм-тройка из итальянской шерсти. Приталенный силуэт, однобортный пиджак с двумя пуговицами. Жилет с пятью пуговицами идеально дополняет образ. Брюки с классической посадкой. Подкладка из вискозы обеспечивает комфорт в течение всего дня.',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 3 },
      { size: '48', stock: 5 },
      { size: '50', stock: 2 },
      { size: '52', stock: 0 },
      { size: '54', stock: 1 },
    ],
  },
  {
    id: '2',
    name: 'Костюм-тройка Navy Premium',
    article: 'AS-S002',
    price: 52900,
    category: 'suits',
    collection: 'classic',
    description: 'Элегантный костюм-тройка темно-синего цвета. Изготовлен из премиальной шерсти Super 120s. Современный крой с узкими лацканами. Идеален для деловых встреч и особых случаев.',
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 2 },
      { size: '48', stock: 4 },
      { size: '50', stock: 3 },
      { size: '52', stock: 1 },
      { size: '54', stock: 0 },
    ],
  },
  {
    id: '3',
    name: 'Костюм-тройка Black Formal',
    article: 'AS-S003',
    price: 48900,
    category: 'suits',
    collection: 'classic',
    description: 'Строгий черный костюм-тройка для торжественных мероприятий. Классический крой с двумя шлицами. Атласные детали на лацканах пиджака и жилете придают особую элегантность.',
    images: [
      'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&q=80',
      'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&q=80',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 1 },
      { size: '48', stock: 3 },
      { size: '50', stock: 4 },
      { size: '52', stock: 2 },
      { size: '54', stock: 2 },
    ],
  },
  // Classic Collection - Shirts
  {
    id: '4',
    name: 'Рубашка Oxford White',
    article: 'AS-SH001',
    price: 8900,
    category: 'shirts',
    collection: 'classic',
    description: 'Классическая белая рубашка из хлопка Oxford. Приталенный крой Slim Fit. Воротник Kent с жесткими вставками. Перламутровые пуговицы. Идеальна для делового образа.',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
      'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 8 },
      { size: '48', stock: 10 },
      { size: '50', stock: 6 },
      { size: '52', stock: 4 },
      { size: '54', stock: 3 },
    ],
  },
  {
    id: '5',
    name: 'Рубашка French Blue',
    article: 'AS-SH002',
    price: 9500,
    category: 'shirts',
    collection: 'classic',
    description: 'Элегантная рубашка небесно-голубого цвета из египетского хлопка. Французские манжеты для запонок. Воротник с широким расстоянием между концами.',
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
      'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 5 },
      { size: '48', stock: 7 },
      { size: '50', stock: 4 },
      { size: '52', stock: 2 },
      { size: '54', stock: 0 },
    ],
  },
  // Classic Collection - Coats
  {
    id: '6',
    name: 'Пальто Wool Overcoat',
    article: 'AS-C001',
    price: 35900,
    category: 'coats',
    collection: 'classic',
    description: 'Классическое шерстяное пальто длиной до колена. Двубортная застежка с шестью пуговицами. Лацканы с острыми концами. Два боковых кармана с клапанами. Подкладка из вискозы.',
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd628b9?w=800&q=80',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
      'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 2 },
      { size: '48', stock: 3 },
      { size: '50', stock: 2 },
      { size: '52', stock: 1 },
      { size: '54', stock: 1 },
    ],
  },
  {
    id: '7',
    name: 'Пальто Camel Classic',
    article: 'AS-C002',
    price: 42900,
    category: 'coats',
    collection: 'classic',
    description: 'Роскошное пальто верблюжьего цвета из смеси кашемира и шерсти. Однобортная застежка. Приталенный силуэт. Идеально сочетается как с деловым костюмом, так и с casual образом.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
      'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 1 },
      { size: '48', stock: 2 },
      { size: '50', stock: 3 },
      { size: '52', stock: 1 },
      { size: '54', stock: 0 },
    ],
  },
  // Classic Collection - Vests
  {
    id: '8',
    name: 'Жилет Classic Gray',
    article: 'AS-V001',
    price: 12900,
    category: 'vests',
    collection: 'classic',
    description: 'Элегантный серый жилет из костюмной ткани. Пять пуговиц спереди, регулируемый ремешок сзади. Два прорезных кармана. Шелковая подкладка.',
    images: [
      'https://images.unsplash.com/photo-1594938374182-a57061adaef3?w=800&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 4 },
      { size: '48', stock: 6 },
      { size: '50', stock: 3 },
      { size: '52', stock: 2 },
      { size: '54', stock: 1 },
    ],
  },
  // Casual Collection - Knitwear
  {
    id: '9',
    name: 'Свитер Merino V-neck',
    article: 'AS-K001',
    price: 14900,
    category: 'knitwear',
    collection: 'casual',
    description: 'Мягкий свитер из мериносовой шерсти с V-образным вырезом. Тонкая вязка, классический крой. Идеально подходит для многослойных образов.',
    images: [
      'https://images.unsplash.com/photo-1638643391904-9b551ba91eaa?w=800&q=80',
      'https://images.unsplash.com/photo-1614495039153-e9cd13240469?w=800&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 5 },
      { size: '48', stock: 7 },
      { size: '50', stock: 4 },
      { size: '52', stock: 3 },
      { size: '54', stock: 2 },
    ],
  },
  {
    id: '10',
    name: 'Кардиган Cashmere Blend',
    article: 'AS-K002',
    price: 19900,
    category: 'knitwear',
    collection: 'casual',
    description: 'Роскошный кардиган из смеси кашемира и шерсти. Застежка на пуговицы. Рельефная вязка. Два накладных кармана.',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
      'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 3 },
      { size: '48', stock: 4 },
      { size: '50', stock: 2 },
      { size: '52', stock: 1 },
      { size: '54', stock: 1 },
    ],
  },
  // Casual Collection - Jeans
  {
    id: '11',
    name: 'Джинсы Slim Dark',
    article: 'AS-J001',
    price: 11900,
    category: 'jeans',
    collection: 'casual',
    description: 'Темно-синие джинсы зауженного кроя. Японский деним премиум-класса. Классическая пятикарманная модель. Легкий стрейч для комфорта.',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 6 },
      { size: '48', stock: 8 },
      { size: '50', stock: 5 },
      { size: '52', stock: 3 },
      { size: '54', stock: 2 },
    ],
  },
  {
    id: '12',
    name: 'Джинсы Straight Classic',
    article: 'AS-J002',
    price: 10900,
    category: 'jeans',
    collection: 'casual',
    description: 'Классические джинсы прямого кроя средней посадки. Качественный итальянский деним. Винтажная обработка для естественного вида.',
    images: [
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 4 },
      { size: '48', stock: 6 },
      { size: '50', stock: 5 },
      { size: '52', stock: 2 },
      { size: '54', stock: 1 },
    ],
  },
  // Casual Collection - Jackets
  {
    id: '13',
    name: 'Куртка Leather Classic',
    article: 'AS-JK001',
    price: 39900,
    category: 'jackets',
    collection: 'casual',
    description: 'Классическая кожаная куртка из мягкой овечьей кожи. Воротник-стойка, молния. Внутренние и внешние карманы. Подкладка из хлопка.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 2 },
      { size: '48', stock: 3 },
      { size: '50', stock: 2 },
      { size: '52', stock: 1 },
      { size: '54', stock: 0 },
    ],
  },
  {
    id: '14',
    name: 'Куртка Bomber Navy',
    article: 'AS-JK002',
    price: 24900,
    category: 'jackets',
    collection: 'casual',
    description: 'Стильная куртка-бомбер темно-синего цвета. Нейлоновая ткань с водоотталкивающей пропиткой. Трикотажные манжеты и низ. Два боковых кармана на молнии.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
      'https://images.unsplash.com/photo-1548712241-1e9b5c10bbf1?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 4 },
      { size: '48', stock: 5 },
      { size: '50', stock: 3 },
      { size: '52', stock: 2 },
      { size: '54', stock: 1 },
    ],
  },
  // Casual Collection - Polo
  {
    id: '15',
    name: 'Поло Pique Classic',
    article: 'AS-P001',
    price: 7900,
    category: 'polo',
    collection: 'casual',
    description: 'Классическое поло из хлопка пике. Приталенный крой. Воротник-стойка с двумя пуговицами. Разрезы по бокам для свободы движений.',
    images: [
      'https://images.unsplash.com/photo-1625910513413-5fc42ac3a887?w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 8 },
      { size: '48', stock: 10 },
      { size: '50', stock: 6 },
      { size: '52', stock: 4 },
      { size: '54', stock: 3 },
    ],
  },
  {
    id: '16',
    name: 'Поло Long Sleeve',
    article: 'AS-P002',
    price: 8900,
    category: 'polo',
    collection: 'casual',
    description: 'Поло с длинным рукавом из мягкого хлопка. Три пуговицы на планке. Манжеты на пуговицах. Идеально для прохладной погоды.',
    images: [
      'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800&q=80',
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80',
    ],
    sizes: [
      { size: '46', stock: 5 },
      { size: '48', stock: 7 },
      { size: '50', stock: 4 },
      { size: '52', stock: 2 },
      { size: '54', stock: 1 },
    ],
  },
]

// Helper functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
}

export function getProductsByCollection(collection: 'classic' | 'casual'): Product[] {
  return products.filter(p => p.collection === collection)
}

export function getProductsByCategory(collection: 'classic' | 'casual', categorySlug: string): Product[] {
  const collectionProducts = getProductsByCollection(collection)
  if (categorySlug === 'all') {
    return collectionProducts
  }
  return collectionProducts.filter(p => p.category === categorySlug)
}

export function getCategoriesByCollection(collection: 'classic' | 'casual'): Category[] {
  return collection === 'classic' ? classicCategories : casualCategories
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getProductsByIds(ids: string[]): Product[] {
  return products.filter(p => ids.includes(p.id))
}
