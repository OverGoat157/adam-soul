// front/lib/api/products.ts
import { mockCategories, mockProducts } from '@/lib/mock-data'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export interface Product {
  id: number
  id_1c: string
  name: string
  article: string
  price: number
  description: string
  main_image: string
  total_stock: number
  category_name: string
  sizes: Array<{
    size: string
    stock: number
  }>
  images: Array<{
    id: number
    image_url: string
    is_from_1c: boolean
    sort_order: number
  }>
  is_hidden: boolean
  synced_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
}

export interface SyncLog {
  id: number
  started_at: string
  finished_at: string | null
  status: 'running' | 'success' | 'error'
  products_synced: number
  categories_synced: number
  error_message: string
  duration?: number
}

// Получить все категории
export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK_DATA) {
    console.log('Using mock categories data')
    return Promise.resolve(mockCategories)
  }

  try {
    const res = await fetch(`${API_URL}/categories/`, {
      next: { revalidate: 900 } // Кеш на 15 минут
    })
    
    if (!res.ok) {
      console.warn('Failed to fetch categories from API, using mock data')
      return mockCategories
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    console.log('Falling back to mock data')
    return mockCategories
  }
}

// Получить категории по коллекции
export async function getCategoriesByCollection(collection: 'classic' | 'casual'): Promise<Category[]> {
  try {
    const allCategories = await getCategories()
    // Фильтрация по коллекции - адаптируйте под вашу логику
    // Например, можно использовать parent или добавить поле collection_type в модель
    return allCategories
  } catch (error) {
    console.error('Error fetching categories by collection:', error)
    return mockCategories
  }
}

// Получить товары по категории
export async function getProducts(category: string = 'all', collection?: string): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    console.log('Using mock products data')
    let filtered = mockProducts
    
    if (category !== 'all') {
      const categoryData = mockCategories.find(c => c.slug === category)
      if (categoryData) {
        filtered = mockProducts.filter(p => p.category_name === categoryData.name)
      }
    }
    
    return Promise.resolve(filtered)
  }

  try {
    const params = new URLSearchParams()
    if (category !== 'all') params.append('category', category)
    if (collection) params.append('collection', collection)
    
    const res = await fetch(`${API_URL}/products/?${params.toString()}`, {
      next: { revalidate: 900 }
    })
    
    if (!res.ok) {
      console.warn('Failed to fetch products from API, using mock data')
      return mockProducts
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    console.log('Falling back to mock data')
    
    // Фильтруем моковые данные по категории
    let filtered = mockProducts
    if (category !== 'all') {
      const categoryData = mockCategories.find(c => c.slug === category)
      if (categoryData) {
        filtered = mockProducts.filter(p => p.category_name === categoryData.name)
      }
    }
    return filtered
  }
}

// Получить товары по категории с фильтром по коллекции
export async function getProductsByCategory(
  collection: 'classic' | 'casual',
  category: string
): Promise<Product[]> {
  return getProducts(category, collection)
}

// Получить один товар
export async function getProduct(id: number): Promise<Product | null> {
  if (USE_MOCK_DATA) {
    console.log('Using mock product data')
    return Promise.resolve(mockProducts.find(p => p.id === id) || null)
  }

  try {
    const res = await fetch(`${API_URL}/products/${id}/`)
    
    if (!res.ok) {
      console.warn('Failed to fetch product from API, using mock data')
      return mockProducts.find(p => p.id === id) || null
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return mockProducts.find(p => p.id === id) || null
  }
}

// ADMIN: Получить все товары для админки
export async function getAllProducts(token: string): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    console.log('Using mock products data for admin')
    return Promise.resolve(mockProducts)
  }

  try {
    const res = await fetch(`${API_URL}/products/?include_hidden=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })
    
    if (!res.ok) {
      console.warn('Failed to fetch all products from API, using mock data')
      return mockProducts
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching all products:', error)
    return mockProducts
  }
}

// ADMIN: Добавить изображение
export async function addProductImage(
  productId: number,
  imageUrl: string,
  token: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Adding image to product', productId)
    return Promise.resolve()
  }

  const res = await fetch(`${API_URL}/products/${productId}/add_image/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image_url: imageUrl })
  })
  
  if (!res.ok) throw new Error('Failed to add image')
}

// ADMIN: Изменить порядок изображений
export async function reorderImages(
  productId: number,
  imageIds: number[],
  token: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Reordering images for product', productId)
    return Promise.resolve()
  }

  const res = await fetch(`${API_URL}/products/${productId}/reorder_images/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image_ids: imageIds })
  })
  
  if (!res.ok) throw new Error('Failed to reorder images')
}

// ADMIN: Удалить изображение
export async function deleteProductImage(imageId: number, token: string): Promise<void> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Deleting image', imageId)
    return Promise.resolve()
  }

  const res = await fetch(`${API_URL}/product-images/${imageId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) throw new Error('Failed to delete image')
}

// ADMIN: Скрыть/показать товар
export async function toggleProductVisibility(
  productId: number,
  token: string
): Promise<{ is_hidden: boolean }> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Toggling visibility for product', productId)
    return Promise.resolve({ is_hidden: false })
  }

  const res = await fetch(`${API_URL}/products/${productId}/toggle_visibility/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) throw new Error('Failed to toggle visibility')
  return res.json()
}

// ADMIN: Запустить синхронизацию вручную
export async function triggerManualSync(token: string): Promise<{ status: string; log: SyncLog }> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Triggering manual sync')
    return Promise.resolve({
      status: 'success',
      log: {
        id: 1,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        status: 'success',
        products_synced: mockProducts.length,
        categories_synced: mockCategories.length,
        error_message: '',
        duration: 2.5
      }
    })
  }

  const res = await fetch(`${API_URL}/sync/manual_sync/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) throw new Error('Failed to trigger sync')
  return res.json()
}

// ADMIN: Получить логи синхронизации
export async function getSyncLogs(token: string): Promise<SyncLog[]> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Getting sync logs')
    return Promise.resolve([
      {
        id: 1,
        started_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        finished_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        status: 'success',
        products_synced: 5,
        categories_synced: 5,
        error_message: '',
        duration: 60
      }
    ])
  }

  const res = await fetch(`${API_URL}/sync/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) throw new Error('Failed to fetch sync logs')
  return res.json()
}
