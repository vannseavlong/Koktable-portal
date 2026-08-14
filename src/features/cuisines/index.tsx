import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CuisinesDialogs } from './components/cuisines-dialogs'
import { CuisinesPrimaryButtons } from './components/cuisines-primary-buttons'
import { CuisinesProvider } from './components/cuisines-provider'
import { CuisinesTable } from './components/cuisines-table'
import { fetchCuisines } from './data/cuisines-api'

const route = getRouteApi('/_authenticated/cuisines/')

export function Cuisines() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cuisines'],
    queryFn: () => fetchCuisines(),
  })

  return (
    <CuisinesProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Cuisines</h2>
            <p className='text-muted-foreground'>
              Manage the cuisines restaurants can be tagged with across the app.
            </p>
          </div>
          <CuisinesPrimaryButtons />
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load cuisines. Please try again.
          </p>
        ) : (
          <CuisinesTable
            data={isLoading ? [] : (data?.cuisines ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <CuisinesDialogs />
    </CuisinesProvider>
  )
}
