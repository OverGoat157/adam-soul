// front/lib/mock-data.ts
import type { Product, Category } from './api/products'

export const mockCategories: Category[] = [
  { id: 1, name: 'Костюмы тройки', slug: 'suits', parent: null },
  { id: 2, name: 'Рубашки', slug: 'shirts', parent: null },
  { id: 3, name: 'Пальто', slug: 'coats', parent: null },
  { id: 4, name: 'Трикотаж', slug: 'knitwear', parent: null },
  { id: 5, name: 'Жилеты', slug: 'vests', parent: null },
]

export const mockProducts: Product[] = [
  {
    id: 1,
    id_1c: '00000001',
    name: 'Костюм тройка классический',
    article: 'KT-001',
    price: 45000,
    description: 'Элегантный костюм-тройка из премиальной итальянской ткани. Идеален для деловых встреч и торжественных мероприятий.',
    main_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    total_stock: 5,
    category_name: 'Костюмы тройки',
    sizes: [
      { size: '48', stock: 2 },
      { size: '50', stock: 3 },
      { size: '52', stock: 0 },
    ],
    images: [
      {
        id: 1,
        image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
        is_from_1c: true,
        sort_order: 0
      },
      {
        id: 2,
        image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
        is_from_1c: true,
        sort_order: 1
      }
    ],
    is_hidden: false,
    synced_at: new Date().toISOString()
  },
  {
    id: 2,
    id_1c: '00000002',
    name: 'Рубашка белая premium',
    article: 'SH-001',
    price: 8500,
    description: 'Классическая белая рубашка из египетского хлопка. Безупречный крой и исключительный комфорт.',
    main_image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    total_stock: 10,
    category_name: 'Рубашки',
    sizes: [
      { size: 'S', stock: 3 },
      { size: 'M', stock: 4 },
      { size: 'L', stock: 3 },
    ],
    images: [
      {
        id: 3,
        image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
        is_from_1c: true,
        sort_order: 0
      }
    ],
    is_hidden: false,
    synced_at: new Date().toISOString()
  },
  {
    id: 3,
    id_1c: '00000003',
    name: 'Пальто шерстяное',
    article: 'CT-001',
    price: 65000,
    description: 'Элегантное зимнее пальто из натуральной шерсти. Классический крой с современными деталями.',
    main_image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    total_stock: 3,
    category_name: 'Пальто',
    sizes: [
      { size: '48', stock: 1 },
      { size: '50', stock: 2 },
      { size: '52', stock: 0 },
    ],
    images: [
      {
        id: 4,
        image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
        is_from_1c: true,
        sort_order: 0
      }
    ],
    is_hidden: false,
    synced_at: new Date().toISOString()
  },
  {
    id: 4,
    id_1c: '00000004',
    name: 'Свитер кашемировый',
    article: 'KN-001',
    price: 25000,
    description: 'Роскошный свитер из 100% кашемира. Невероятно мягкий и теплый.',
    main_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    total_stock: 8,
    category_name: 'Трикотаж',
    sizes: [
      { size: 'S', stock: 2 },
      { size: 'M', stock: 3 },
      { size: 'L', stock: 3 },
    ],
    images: [
      {
        id: 5,
        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
        is_from_1c: true,
        sort_order: 0
      }
    ],
    is_hidden: false,
    synced_at: new Date().toISOString()
  },
  {
    id: 5,
    id_1c: '00000005',
    name: 'Жилет классический',
    article: 'VS-001',
    price: 15000,
    description: 'Элегантный жилет для создания делового образа. Отлично сочетается с костюмами и рубашками.',
    main_image: 'https://images.unsplash.com/photo-1608602750763-5e3d272a059e?w=800&q=80',
    total_stock: 6,
    category_name: 'Жилеты',
    sizes: [
      { size: '48', stock: 2 },
      { size: '50', stock: 2 },
      { size: '52', stock: 2 },
    ],
    images: [
      {
        id: 6,
        image_url: 'https://images.unsplash.com/photo-1608602750763-5e3d272a059e?w=800&q=80',
        is_from_1c: true,
        sort_order: 0
      }
    ],
    is_hidden: false,
    synced_at: new Date().toISOString()
  }
]
