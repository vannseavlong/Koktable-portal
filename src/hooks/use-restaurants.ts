import { useQuery } from '@tanstack/react-query'
import { fetchRestaurants } from '@/features/restaurants/data/restaurants-api'

// Shared by anything that needs a restaurant_id -> name lookup (e.g. the admin
// Orders table's Restaurant column/filter) without re-fetching the full list
// per page. Admin CRUD (suspend/reactivate) lives separately in the Restaurants
// feature/`/admin/restaurants`.
export function useRestaurants() {
  const { data, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => fetchRestaurants(),
    staleTime: 60_000,
  })

  return { restaurants: data?.restaurants ?? [], isLoading }
}
