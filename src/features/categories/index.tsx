import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CategoriesDialogs } from './components/categories-dialogs'
import { CategoriesPrimaryButtons } from './components/categories-primary-buttons'
import { CategoriesProvider } from './components/categories-provider'
import { CategoriesTable } from './components/categories-table'
import { fetchCategories } from './data/categories-api'

const route = getRouteApi('/_authenticated/categories/')

export function Categories() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  })

  return (
    <CategoriesProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
            <p className='text-muted-foreground'>
              Manage the categories restaurants and catalog items can be tagged
              with across the app.
            </p>
          </div>
          <CategoriesPrimaryButtons />
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load categories. Please try again.
          </p>
        ) : (
          <CategoriesTable
            data={isLoading ? [] : (data?.categories ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <CategoriesDialogs />
    </CategoriesProvider>
  )
}
