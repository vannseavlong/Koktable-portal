import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { MyOrdersDialogs } from './components/my-orders-dialogs'
import { MyOrdersProvider } from './components/my-orders-provider'
import { MyOrdersTable } from './components/my-orders-table'
import { fetchMyOrders } from './data/orders-api'

const route = getRouteApi('/_authenticated/my-orders/')

const PAGE_LIMIT = 100

export function MyOrders() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => fetchMyOrders({ limit: PAGE_LIMIT }),
  })

  return (
    <MyOrdersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>My Orders</h2>
            <p className='text-muted-foreground'>
              Orders for your restaurant, newest first.
            </p>
          </div>
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load orders. Please try again.
          </p>
        ) : (
          <MyOrdersTable
            data={isLoading ? [] : (data?.orders ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <MyOrdersDialogs />
    </MyOrdersProvider>
  )
}
