import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RestaurantsDialogs } from './components/restaurants-dialogs'
import { RestaurantsProvider } from './components/restaurants-provider'
import { RestaurantsTable } from './components/restaurants-table'
import { fetchRestaurants } from './data/restaurants-api'

const route = getRouteApi('/_authenticated/restaurants/')

const PAGE_LIMIT = 100

export function Restaurants() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => fetchRestaurants({ limit: PAGE_LIMIT }),
  })

  return (
    <RestaurantsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Restaurants</h2>
            <p className='text-muted-foreground'>
              Every restaurant on the marketplace. Suspend or reactivate a restaurant&apos;s
              storefront here.
            </p>
          </div>
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load restaurants. Please try again.
          </p>
        ) : (
          <RestaurantsTable
            data={isLoading ? [] : (data?.restaurants ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <RestaurantsDialogs />
    </RestaurantsProvider>
  )
}
