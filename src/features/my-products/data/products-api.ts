import { apiClient } from '@/lib/api-client'
import { type Product } from './schema'

// `/merchant/catalog-items?item_type=product` (ADMIN_API.md § 6) — always
// scoped server-side to the caller's own restaurant from the JWT. Never send a
// `restaurant_id` here.
export function fetchProducts() {
  return apiClient.get<{ items: Product[] }>('/merchant/catalog-items', {
    item_type: 'product',
  })
}

export type ProductPayload = {
  name: string
  description?: string
  price_from: number
  category_id?: string
  active?: boolean
  quantity?: number
  // string ('' clears it, unchanged if omitted) or a new file to upload
  image?: string | File
}

// Always sent as multipart/form-data — `image` may be a File (upload), an
// empty string (clear), or omitted (leave unchanged); see ADMIN_API.md § 6's
// multipart contract for `/merchant/catalog-items`.
function toFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    formData.append(key, value instanceof File ? value : String(value))
  }
  return formData
}

export function createProduct(payload: ProductPayload) {
  const formData = toFormData({ ...payload, item_type: 'product' })
  return apiClient.postForm<{ item: Product }>(
    '/merchant/catalog-items',
    formData
  )
}

export function updateProduct(
  itemId: string,
  payload: Partial<ProductPayload>
) {
  const formData = toFormData(payload)
  return apiClient.patchForm<{ item: Product }>(
    `/merchant/catalog-items/${itemId}`,
    formData
  )
}

export function deleteProduct(itemId: string) {
  return apiClient.delete<void>(`/merchant/catalog-items/${itemId}`)
}
