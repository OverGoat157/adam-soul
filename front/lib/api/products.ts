// front/lib/api/products.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
  try {
    const res = await fetch(`${API_URL}/categories/`, {
      next: { revalidate: 900 }
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// Получить категории по коллекции
export async function getCategoriesByCollection(collection: 'classic' | 'casual'): Promise<Category[]> {
  return getCategories()
}

// Получить товары по категории
export async function getProducts(category: string = 'all', collection?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams()
    if (category !== 'all') params.append('category', category)
    if (collection) params.append('collection', collection)

    const res = await fetch(`${API_URL}/products/?${params.toString()}`, {
      next: { revalidate: 900 }
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
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
  try {
    const res = await fetch(`${API_URL}/products/${id}/`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ADMIN: Получить все товары для админки
export async function getAllProducts(token: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products/?include_hidden=true`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// ADMIN: Добавить изображение
export async function addProductImage(
  productId: number,
  imageUrl: string,
  token: string
): Promise<void> {
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
  const res = await fetch(`${API_URL}/product-images/${imageId}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to delete image')
}

// ADMIN: Скрыть/показать товар
export async function toggleProductVisibility(
  productId: number,
  token: string
): Promise<{ is_hidden: boolean }> {
  const res = await fetch(`${API_URL}/products/${productId}/toggle_visibility/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to toggle visibility')
  return res.json()
}

// ADMIN: Запустить синхронизацию вручную
export async function triggerManualSync(token: string): Promise<{ status: string; log: SyncLog }> {
  const res = await fetch(`${API_URL}/sync/manual_sync/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to trigger sync')
  return res.json()
}

// ADMIN: Получить логи синхронизации
export async function getSyncLogs(token: string): Promise<SyncLog[]> {
  const res = await fetch(`${API_URL}/sync/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch sync logs')
  return res.json()
}
