import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { fetchUsers } from './data/users-api'

const route = getRouteApi('/_authenticated/users/')

const PAGE_LIMIT = 100

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const debouncedSearch = useDebouncedValue(search.search ?? '', 300)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', debouncedSearch],
    queryFn: () => fetchUsers({ search: debouncedSearch, limit: PAGE_LIMIT }),
  })

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Accounts registered through the mobile app. Suspend or reactivate
              access here.
            </p>
          </div>
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load users. Please try again.
          </p>
        ) : (
          <UsersTable
            data={isLoading ? [] : (data?.users ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
