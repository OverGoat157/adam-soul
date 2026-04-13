// front/app/admin/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Upload, X, Plus, Trash2, Save, Search, ImageIcon, RefreshCw, Edit2, Check, Users, Copy, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import {
  getAllProducts,
  uploadProductImage,
  reorderImages,
  deleteProductImage,
  deleteProduct,
  updateProductImage,
  toggleProductVisibility,
  triggerManualSync,
  cancelSync,
  getSyncLogs,
  getSyncStatus,
  getSiteUsers,
  createSiteUser,
  updateSiteUser,
  deleteSiteUser,
  type Product,
  type SyncLog,
  type SiteUser,
} from "@/lib/api/products"
import { cn } from "@/lib/utils"

export default function AdminPage() {
  const { isAuthenticated, user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "out_of_stock">("all")
  const [productImages, setProductImages] = useState<Array<{id: number; image_url: string}>>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [showSyncLogs, setShowSyncLogs] = useState(false)
  const [currentSync, setCurrentSync] = useState<SyncLog | null>(null)
  const [editingImageId, setEditingImageId] = useState<number | null>(null)
  const [editingImageUrl, setEditingImageUrl] = useState("")
  const [activeSection, setActiveSection] = useState<"products" | "users">("products")
  const [siteUsers, setSiteUsers] = useState<SiteUser[]>([])
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [createdUser, setCreatedUser] = useState<SiteUser | null>(null)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editUsername, setEditUsername] = useState("")
  const [editPassword, setEditPassword] = useState("")

  // Protect admin route
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login")
    }
  }, [isAuthenticated, isAdmin, isLoading, router])

  // Load products on mount
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadProducts()
      loadSyncLogs()
      loadSiteUsers()
    }
  }, [isAuthenticated, isAdmin])

  // Poll sync status while sync is running
  useEffect(() => {
    if (!isSyncing) return
    const interval = setInterval(async () => {
      try {
        const syncStatus = await getSyncStatus()
        setCurrentSync(syncStatus)
        if (syncStatus?.status !== 'running') {
          clearInterval(interval)
          setIsSyncing(false)
          if (syncStatus?.status === 'success') {
            await loadProducts()
          }
          await loadSyncLogs()
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [isSyncing])

  // Update images when product selected
  useEffect(() => {
    if (selectedProduct) {
      setProductImages(selectedProduct.images.map(img => ({
        id: img.id,
        image_url: img.image_url
      })))
    }
  }, [selectedProduct])

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const token = localStorage.getItem('admin_token') || ''
      const data = await getAllProducts(token)
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
      alert('Ошибка загрузки товаров')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const loadSyncLogs = async () => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      const logs = await getSyncLogs(token)
      setSyncLogs(logs.slice(0, 10)) // Последние 10 логов
    } catch (error) {
      console.error('Failed to load sync logs:', error)
    }
  }

  const handleManualSync = async () => {
    if (!confirm('Запустить синхронизацию с 1С? Это может занять несколько минут.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token') || ''
      const result = await triggerManualSync(token)

      if (result.status === 'success') {
        setIsSyncing(true)
        setCurrentSync({ id: result.log_id ?? 0, status: 'running', progress: 0, current_step: 'Запуск...', started_at: new Date().toISOString(), finished_at: null, products_synced: 0, categories_synced: 0, error_message: '' })
      } else if (result.status === 'already_running') {
        setIsSyncing(true) // start polling to show current progress
      } else {
        alert('Ошибка при запуске синхронизации. Проверьте логи.')
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Ошибка при запуске синхронизации')
    }
  }

  const handleCancelSync = async () => {
    try {
      await cancelSync()
      setIsSyncing(false)
      setCurrentSync(prev => prev ? { ...prev, status: 'cancelled', current_step: 'Отменено пользователем' } : null)
      await loadSyncLogs()
    } catch (e) {
      console.error('Cancel sync error:', e)
    }
  }

  const loadSiteUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      const users = await getSiteUsers(token)
      setSiteUsers(users)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleCreateUser = async (random: boolean) => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      const created = await createSiteUser(
        token,
        random ? undefined : (newUsername || undefined),
        random ? undefined : (newPassword || undefined)
      )
      setCreatedUser(created)
      setNewUsername("")
      setNewPassword("")
      await loadSiteUsers()
    } catch (error: any) {
      alert(error.message || 'Ошибка создания пользователя')
    }
  }

  const handleStartEditUser = (u: SiteUser) => {
    setEditingUserId(u.id)
    setEditUsername(u.username)
    setEditPassword("")
  }

  const handleSaveUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      await updateSiteUser(userId, token, editUsername || undefined, editPassword || undefined)
      setEditingUserId(null)
      await loadSiteUsers()
    } catch (error: any) {
      alert(error.message || 'Ошибка обновления пользователя')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Удалить пользователя?')) return
    try {
      const token = localStorage.getItem('admin_token') || ''
      await deleteSiteUser(userId, token)
      await loadSiteUsers()
    } catch {
      alert('Ошибка удаления пользователя')
    }
  }

  const handleToggleVisibility = async (productId: number) => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      await toggleProductVisibility(productId, token)
      await loadProducts()
      
      if (selectedProduct?.id === productId) {
        const updated = products.find(p => p.id === productId)
        if (updated) setSelectedProduct(updated)
      }
    } catch (error) {
      console.error('Toggle visibility error:', error)
      alert('Ошибка изменения видимости')
    }
  }

  if (isLoading || isLoadingProducts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E0E0E0] border-t-black" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.article.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ? p.total_stock > 0 : p.total_stock === 0
    return matchesSearch && matchesTab
  })

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedProduct) return
    setIsUploadingImage(true)
    try {
      const token = localStorage.getItem('admin_token') || ''
      for (const file of Array.from(files)) {
        await uploadProductImage(selectedProduct.id, file, token)
      }
      const updatedProducts = await getAllProducts(token)
      setProducts(updatedProducts)
      const updated = updatedProducts.find(p => p.id === selectedProduct.id)
      if (updated) setSelectedProduct(updated)
    } catch (error: any) {
      console.error('Upload image error:', error)
      alert(error?.message || 'Ошибка загрузки изображения')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = async (imageId: number) => {
    if (!confirm('Удалить это изображение?')) return
    if (!selectedProduct) return

    try {
      const token = localStorage.getItem('admin_token') || ''
      await deleteProductImage(selectedProduct.id, imageId, token)
      await loadProducts()
      
      if (selectedProduct) {
        const updated = products.find(p => p.id === selectedProduct.id)
        if (updated) setSelectedProduct(updated)
      }
    } catch (error) {
      console.error('Remove image error:', error)
      alert('Ошибка удаления изображения')
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены? Товар будет удалён полностью!')) return
    try {
      const token = localStorage.getItem('admin_token') || ''
      await deleteProduct(productId, token)
      setSelectedProduct(null)
      await loadProducts()
    } catch (error) {
      console.error('Delete product error:', error)
      alert('Ошибка удаления товара')
    }
  }

  const handleStartEditImage = (imageId: number, currentUrl: string) => {
    setEditingImageId(imageId)
    setEditingImageUrl(currentUrl)
  }

  const handleSaveImageUrl = async (imageId: number) => {
    if (!selectedProduct || !editingImageUrl.trim()) return
    try {
      const token = localStorage.getItem('admin_token') || ''
      await updateProductImage(selectedProduct.id, imageId, editingImageUrl.trim(), token)
      setEditingImageId(null)
      setEditingImageUrl("")
      await loadProducts()
      const updated = products.find(p => p.id === selectedProduct.id)
      if (updated) setSelectedProduct(updated)
    } catch (error) {
      console.error('Update image error:', error)
      alert('Ошибка обновления изображения')
    }
  }

  const handleMoveImage = async (index: number, direction: "up" | "down") => {
    if (!selectedProduct) return

    const newImages = [...productImages]
    const newIndex = direction === "up" ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
      setProductImages(newImages)

      try {
        const token = localStorage.getItem('admin_token') || ''
        const imageIds = newImages.map(img => img.id)
        await reorderImages(selectedProduct.id, imageIds, token)
      } catch (error) {
        console.error('Reorder error:', error)
        alert('Ошибка изменения порядка')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <main className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-16">
        {/* Back Button */}
        <Link
          href="/catalog/classic"
          className="group mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#999999] transition-colors duration-300 hover:text-[#1A1A1A]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />
          Вернуться в каталог
        </Link>

        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[4px] text-[#999999]">
              Администрирование
            </p>
            <h1 className="text-[36px] md:text-[42px] font-light text-[#1A1A1A] tracking-tight">
              Admin Panel
            </h1>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setActiveSection("products")}
                className={cn("px-4 py-2 text-[12px] font-medium uppercase tracking-wide transition-colors",
                  activeSection === "products" ? "bg-black text-white" : "border border-[#E0E0E0] text-[#666666] hover:bg-[#F8F8F8]"
                )}
              >
                Товары
              </button>
              <button
                onClick={() => setActiveSection("users")}
                className={cn("flex items-center gap-2 px-4 py-2 text-[12px] font-medium uppercase tracking-wide transition-colors",
                  activeSection === "users" ? "bg-black text-white" : "border border-[#E0E0E0] text-[#666666] hover:bg-[#F8F8F8]"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Пользователи
              </button>
            </div>
          </div>

          {/* Sync Button */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowSyncLogs(!showSyncLogs)}
              className="px-4 py-2.5 border border-[#E0E0E0] text-[13px] font-medium text-[#666666] hover:bg-[#F8F8F8] transition-colors"
            >
              Логи
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-white transition-all",
                isSyncing
                  ? "bg-[#999999] cursor-not-allowed"
                  : "bg-black hover:bg-[#333333]"
              )}
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Синхронизация..." : "Синхронизировать"}
            </button>
          </div>
        </div>

        {/* Sync Progress Bar */}
        {currentSync && (isSyncing || currentSync.status === 'running' || currentSync.status === 'error') && (
          <div className="mb-6 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex items-center justify-between">
              <span className={cn(
                "text-[13px] font-medium",
                currentSync.status === 'error' ? "text-red-600" : "text-[#1A1A1A]"
              )}>
                {currentSync.status === 'error'
                  ? `Ошибка: ${currentSync.error_message || 'Неизвестная ошибка'}`
                  : currentSync.current_step || 'Синхронизация...'}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-[#999999]">{currentSync.progress}%</span>
                {isSyncing && (
                  <button
                    onClick={handleCancelSync}
                    className="text-[12px] font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
            <div className="h-1.5 w-full bg-[#F0F0F0] overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  currentSync.status === 'error' ? "bg-red-500" : "bg-black",
                  isSyncing && currentSync.status === 'running' && "animate-pulse"
                )}
                style={{ width: `${currentSync.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Sync Logs */}
        {showSyncLogs && (
          <div className="mb-8 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="mb-4 text-[16px] font-medium">Последние синхронизации</h3>
            <div className="space-y-2">
              {syncLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-[#F8F8F8] text-[13px]">
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-2 py-1 text-[11px] font-medium uppercase",
                      log.status === 'success' && "bg-green-100 text-green-800",
                      log.status === 'error' && "bg-red-100 text-red-800",
                      log.status === 'running' && "bg-blue-100 text-blue-800"
                    )}>
                      {log.status}
                    </span>
                    <span className="text-[#666666]">
                      {new Date(log.started_at).toLocaleString('ru-RU')}
                    </span>
                    <span>
                      Товаров: {log.products_synced} | Категорий: {log.categories_synced}
                    </span>
                  </div>
                  {log.duration && (
                    <span className="text-[#999999]">{log.duration.toFixed(1)}с</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <div className="grid gap-6 md:gap-8 lg:grid-cols-[400px,1fr]">
            {/* Create User */}
            <div className="bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h3 className="mb-5 text-[16px] font-medium text-[#1A1A1A]">Создать пользователя</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Логин (оставьте пустым для случайного)"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="h-11 w-full bg-[#F8F8F8] px-4 text-[13px] text-[#1A1A1A] placeholder:text-[#999999] outline-none focus:bg-[#F0F0F0]"
                />
                <input
                  type="text"
                  placeholder="Пароль (оставьте пустым для случайного)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 w-full bg-[#F8F8F8] px-4 text-[13px] text-[#1A1A1A] placeholder:text-[#999999] outline-none focus:bg-[#F0F0F0]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateUser(false)}
                    className="flex-1 h-11 bg-black text-white text-[12px] font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors"
                  >
                    Создать
                  </button>
                  <button
                    onClick={() => handleCreateUser(true)}
                    className="flex-1 h-11 border border-[#E0E0E0] text-[12px] font-medium text-[#666] uppercase tracking-wide hover:bg-[#F8F8F8] transition-colors"
                  >
                    Случайные данные
                  </button>
                </div>
              </div>

              {/* Created user credentials */}
              {createdUser && (
                <div className="mt-5 bg-green-50 border border-green-200 p-4">
                  <p className="mb-2 text-[12px] font-semibold text-green-800 uppercase tracking-wide">Пользователь создан</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#666]">Логин:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-[13px] font-mono font-bold text-[#1A1A1A]">{createdUser.username}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(createdUser.username)}
                          className="text-[#999] hover:text-[#1A1A1A]"
                          title="Скопировать"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#666]">Пароль:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-[13px] font-mono font-bold text-[#1A1A1A]">{createdUser.password}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(createdUser.password || '')}
                          className="text-[#999] hover:text-[#1A1A1A]"
                          title="Скопировать"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(`Логин: ${createdUser.username}\nПароль: ${createdUser.password}`)}
                      className="mt-1 w-full flex items-center justify-center gap-2 h-9 border border-green-300 text-[12px] text-green-700 hover:bg-green-100 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Скопировать всё
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User List */}
            <div className="bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h3 className="mb-5 text-[16px] font-medium text-[#1A1A1A]">
                Пользователи каталога ({siteUsers.length})
              </h3>
              {siteUsers.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-[14px] text-[#999]">
                  Нет пользователей
                </div>
              ) : (
                <div className="space-y-2">
                  {siteUsers.map(u => (
                    <div key={u.id} className="bg-[#F8F8F8]">
                      {editingUserId === u.id ? (
                        <div className="p-3 space-y-2">
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Логин"
                            className="h-9 w-full bg-white border border-[#E0E0E0] px-3 text-[13px] outline-none focus:border-black"
                          />
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Новый пароль (оставьте пустым чтобы не менять)"
                            className="h-9 w-full bg-white border border-[#E0E0E0] px-3 text-[13px] outline-none focus:border-black"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveUser(u.id)}
                              className="flex-1 h-8 bg-black text-white text-[11px] font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors"
                            >
                              Сохранить
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="flex-1 h-8 border border-[#E0E0E0] text-[11px] text-[#666] uppercase tracking-wide hover:bg-white transition-colors"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3">
                          <span className="text-[14px] font-mono font-medium text-[#1A1A1A]">{u.username}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditUser(u)}
                              className="flex h-8 w-8 items-center justify-center text-[#999] hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Изменить"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="flex h-8 w-8 items-center justify-center text-[#999] hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Section */}
        {activeSection === "products" && <div className="grid gap-6 md:gap-8 lg:grid-cols-[350px,1fr]">
          {/* Left: Product List */}
          <div className="bg-white p-4 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex border-b border-[#E0E0E0]">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-4 py-2.5 text-[12px] font-medium uppercase tracking-wide transition-colors",
                  activeTab === "all"
                    ? "border-b-2 border-black text-[#1A1A1A] -mb-px"
                    : "text-[#999999] hover:text-[#666666]"
                )}
              >
                В наличии
              </button>
              <button
                onClick={() => setActiveTab("out_of_stock")}
                className={cn(
                  "px-4 py-2.5 text-[12px] font-medium uppercase tracking-wide transition-colors",
                  activeTab === "out_of_stock"
                    ? "border-b-2 border-black text-[#1A1A1A] -mb-px"
                    : "text-[#999999] hover:text-[#666666]"
                )}
              >
                Нет в наличии
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
                <input
                  type="text"
                  placeholder="Поиск по названию или артикулу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full bg-[#F8F8F8] pl-11 pr-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] outline-none transition-colors focus:bg-[#F0F0F0]"
                />
              </div>
            </div>

            <div className="max-h-[350px] md:max-h-[600px] overflow-y-auto scrollbar-thin">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      "flex w-full items-center gap-3 md:gap-4 p-3 md:p-4 text-left transition-colors",
                      selectedProduct?.id === product.id
                        ? "bg-black text-white"
                        : "hover:bg-[#F8F8F8]"
                    )}
                  >
                    <div className="relative h-14 w-10 md:h-16 md:w-12 flex-shrink-0 overflow-hidden bg-[#F0F0F0]">
                      {product.main_image && (
                        <Image
                          src={product.main_image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] md:text-[14px] font-medium">
                        {product.name}
                      </p>
                      <p className={cn(
                        "text-[11px] md:text-[12px]",
                        selectedProduct?.id === product.id ? "text-white/70" : "text-[#999999]"
                      )}>
                        {product.article}
                      </p>
                      {product.is_hidden && (
                        <span className="text-[10px] text-red-500">Скрыт</span>
                      )}
                    </div>
                    <div className={cn(
                      "flex h-5 w-5 md:h-6 md:w-6 items-center justify-center text-[10px] md:text-[11px] font-medium flex-shrink-0",
                      selectedProduct?.id === product.id ? "bg-white text-black" : "bg-[#F0F0F0] text-[#666666]"
                    )}>
                      {product.images.length}
                    </div>
                  </button>
                  
                  {/* Toggle visibility button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(product.id)
                    }}
                    className="absolute right-2 top-2 p-1 text-[10px] bg-white hover:bg-gray-100 rounded"
                    title={product.is_hidden ? "Показать" : "Скрыть"}
                  >
                    {product.is_hidden ? "👁️" : "🚫"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image Editor - остальной код без изменений */}
          <div className="bg-white p-4 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            {selectedProduct ? (
              <>
                <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-[20px] md:text-[24px] font-light text-[#1A1A1A]">
                      {selectedProduct.name}
                    </h2>
                    <p className="mt-1 text-[12px] md:text-[13px] text-[#999999]">
                      Артикул: {selectedProduct.article} | Цена: {selectedProduct.price}₽
                    </p>
                    <p className="mt-1 text-[12px] text-[#999999]">
                      Остаток: {selectedProduct.total_stock} шт.
                    </p>
                    <p className="mt-1 text-[11px] text-[#999999]">
                      Синхронизировано: {new Date(selectedProduct.synced_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(selectedProduct.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-[12px] font-medium uppercase tracking-wide hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить товар
                  </button>
                </div>

                {/* Add New Image */}
                <div className="mb-6 md:mb-8 border-b border-[#F0F0F0] pb-6 md:pb-8">
                  <p className="mb-3 md:mb-4 text-[10px] md:text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                    Добавить изображение
                  </p>

                  <label
                    className={cn(
                      "flex h-12 md:h-14 items-center justify-center gap-2 md:gap-3 bg-black text-white cursor-pointer transition-all duration-300 hover:bg-[#333333]",
                      isUploadingImage && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Upload className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-[12px] md:text-[13px] font-medium uppercase tracking-wide">
                      {isUploadingImage ? "Загрузка..." : "Выбрать файлы с устройства"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        handleUploadFiles(e.target.files)
                        e.target.value = ""
                      }}
                      className="hidden"
                    />
                  </label>

                  <p className="mt-2 md:mt-3 text-[11px] md:text-[12px] text-[#999999]">
                    JPG, PNG или WebP, до 10 МБ. Можно выбрать несколько файлов сразу.
                  </p>
                </div>

                {/* Image List */}
                <div>
                  <p className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-[#999999]">
                    Изображения товара ({productImages.length})
                  </p>

                  {productImages.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center bg-[#F8F8F8] text-center">
                      <ImageIcon className="mb-3 h-10 w-10 text-[#CCCCCC]" />
                      <p className="text-[14px] text-[#999999]">
                        Нет изображений
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {productImages.map((image, index) => (
                        <div key={image.id} className="group relative">
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#F0F0F0]">
                            <Image
                              src={image.image_url}
                              alt={`Изображение ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              {index > 0 && (
                                <button
                                  onClick={() => handleMoveImage(index, "up")}
                                  className="flex h-10 w-10 items-center justify-center bg-white text-[#1A1A1A] transition-colors hover:bg-[#F0F0F0]"
                                  title="Переместить влево"
                                >
                                  <ArrowLeft className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleStartEditImage(image.id, image.image_url)}
                                className="flex h-10 w-10 items-center justify-center bg-blue-500 text-white transition-colors hover:bg-blue-600"
                                title="Изменить URL"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveImage(image.id)}
                                className="flex h-10 w-10 items-center justify-center bg-[#E53E3E] text-white transition-colors hover:bg-[#C53030]"
                                title="Удалить"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {index < productImages.length - 1 && (
                                <button
                                  onClick={() => handleMoveImage(index, "down")}
                                  className="flex h-10 w-10 items-center justify-center bg-white text-[#1A1A1A] transition-colors hover:bg-[#F0F0F0]"
                                  title="Переместить вправо"
                                >
                                  <ArrowLeft className="h-4 w-4 rotate-180" />
                                </button>
                              )}
                            </div>

                            {/* Index Badge */}
                            <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center bg-white text-[12px] font-medium text-[#1A1A1A]">
                              {index + 1}
                            </div>

                            {/* Main Badge */}
                            {index === 0 && (
                              <div className="absolute right-3 top-3 bg-black px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                                Главное
                              </div>
                            )}
                          </div>

                          {/* Edit URL inline */}
                          {editingImageId === image.id && (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                value={editingImageUrl}
                                onChange={(e) => setEditingImageUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveImageUrl(image.id)}
                                className="h-9 flex-1 bg-[#F8F8F8] px-3 text-[12px] text-[#1A1A1A] outline-none focus:bg-[#F0F0F0]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveImageUrl(image.id)}
                                className="flex h-9 w-9 items-center justify-center bg-green-600 text-white hover:bg-green-700"
                                title="Сохранить"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setEditingImageId(null); setEditingImageUrl("") }}
                                className="flex h-9 w-9 items-center justify-center bg-gray-400 text-white hover:bg-gray-500"
                                title="Отмена"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-[#F8F8F8] p-6">
                  <p className="mb-2 text-[13px] font-medium text-[#1A1A1A]">
                    Интеграция с 1С
                  </p>
                  <p className="text-[13px] text-[#666666] leading-relaxed">
                    Основные данные о товарах синхронизируются автоматически каждые 15 минут через CommerceML 2.0.
                    Дополнительные фотографии можно добавить вручную через эту панель.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[300px] md:min-h-[400px] flex-col items-center justify-center text-center">
                <div className="mb-4 md:mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center bg-[#F8F8F8]">
                  <Upload className="h-6 w-6 md:h-8 md:w-8 text-[#CCCCCC]" />
                </div>
                <h3 className="mb-2 text-[16px] md:text-[18px] font-light text-[#1A1A1A]">
                  Выберите товар
                </h3>
                <p className="max-w-[280px] text-[13px] md:text-[14px] text-[#999999]">
                  <span className="hidden lg:inline">Выберите товар из списка слева для редактирования изображений</span>
                  <span className="lg:hidden">Выберите товар из списка выше для редактирования изображений</span>
                </p>
              </div>
            )}
          </div>
        </div>}
      </main>
    </div>
  )
}