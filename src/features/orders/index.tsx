import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersProvider } from './components/orders-provider'
import { OrdersTable } from './components/orders-table'
import { fetchReservations } from './data/reservations-api'

const route = getRouteApi('/_authenticated/orders/')

const PAGE_LIMIT = 100

export function Orders() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => fetchReservations({ limit: PAGE_LIMIT }),
  })

  return (
    <OrdersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Orders</h2>
            <p className='text-muted-foreground'>
              Every reservation across every customer, newest first.
            </p>
          </div>
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load reservations. Please try again.
          </p>
        ) : (
          <OrdersTable
            data={isLoading ? [] : (data?.reservations ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}
