import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ServicesDialogs } from './components/services-dialogs'
import { ServicesPrimaryButtons } from './components/services-primary-buttons'
import { ServicesProvider } from './components/services-provider'
import { ServicesTable } from './components/services-table'
import { fetchServices } from './data/services-api'

const route = getRouteApi('/_authenticated/content/')

export function Content() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchServices(),
  })

  return (
    <ServicesProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Content Catalogue
            </h2>
            <p className='text-muted-foreground'>
              Manage the services shown to customers in the mobile app.
            </p>
          </div>
          <ServicesPrimaryButtons />
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load services. Please try again.
          </p>
        ) : (
          <ServicesTable
            data={isLoading ? [] : (data?.services ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <ServicesDialogs />
    </ServicesProvider>
  )
}
