import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'
import { fetchProducts } from './data/products-api'

const route = getRouteApi('/_authenticated/my-products/')

export function MyProducts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-products'],
    queryFn: () => fetchProducts(),
  })

  return (
    <ProductsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>My Products</h2>
            <p className='text-muted-foreground'>
              Manage the merchandise, ingredients, and other physical items your
              restaurant sells.
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load your products. Please try again.
          </p>
        ) : (
          <ProductsTable
            data={isLoading ? [] : (data?.items ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  )
}
