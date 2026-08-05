import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CatalogItemsDialogs } from './components/catalog-items-dialogs'
import { CatalogItemsPrimaryButtons } from './components/catalog-items-primary-buttons'
import { CatalogItemsProvider } from './components/catalog-items-provider'
import { CatalogItemsTable } from './components/catalog-items-table'
import { fetchCatalogItems } from './data/catalog-items-api'

const route = getRouteApi('/_authenticated/my-catalog/')

export function MyCatalog() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-catalog-items'],
    queryFn: () => fetchCatalogItems(),
  })

  return (
    <CatalogItemsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>My Catalog</h2>
            <p className='text-muted-foreground'>
              Manage the services your restaurant offers.
            </p>
          </div>
          <CatalogItemsPrimaryButtons />
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load your catalog. Please try again.
          </p>
        ) : (
          <CatalogItemsTable
            data={isLoading ? [] : (data?.items ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <CatalogItemsDialogs />
    </CatalogItemsProvider>
  )
}
