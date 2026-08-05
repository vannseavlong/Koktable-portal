import { useQuery } from '@tanstack/react-query'
import { fetchPublicCategories } from '@/features/categories/data/categories-api'

// Shared by every category dropdown (admin Content, merchant My Catalog/My
// Products/My Restaurant) — all read the same public, active-only list rather than
// each feature fetching its own copy. Admin CRUD (add/edit/reorder/delete the
// list itself) lives separately in the Categories feature/`/admin/categories`.
export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories', 'public'],
    queryFn: () => fetchPublicCategories(),
    staleTime: 60_000,
  })

  return { categories: data?.categories ?? [], isLoading }
}
