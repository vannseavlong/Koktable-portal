import { useQuery } from '@tanstack/react-query'
import { fetchPublicCuisines } from '@/features/cuisines/data/cuisines-api'

// Shared by every cuisine dropdown/picker (merchant My Restaurant) — reads the
// same public, active-only list rather than each feature fetching its own
// copy. Admin CRUD (add/edit/reorder/delete the list itself) lives separately
// in the Cuisines feature/`/admin/cuisines`.
export function useCuisines() {
  const { data, isLoading } = useQuery({
    queryKey: ['cuisines', 'public'],
    queryFn: () => fetchPublicCuisines(),
    staleTime: 60_000,
  })

  return { cuisines: data?.cuisines ?? [], isLoading }
}
