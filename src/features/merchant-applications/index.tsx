import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { MerchantApplicationsDialogs } from './components/merchant-applications-dialogs'
import { MerchantApplicationsProvider } from './components/merchant-applications-provider'
import { MerchantApplicationsTable } from './components/merchant-applications-table'
import { fetchMerchantApplications } from './data/merchant-applications-api'

const route = getRouteApi('/_authenticated/merchant-applications/')

const PAGE_LIMIT = 100

export function MerchantApplications() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['merchant-applications'],
    queryFn: () => fetchMerchantApplications({ limit: PAGE_LIMIT }),
  })

  return (
    <MerchantApplicationsProvider>
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
              Merchant Applications
            </h2>
            <p className='text-muted-foreground'>
              Review restaurant registration requests. Approving one creates a
              restaurant and emails the applicant an invite.
            </p>
          </div>
        </div>
        {isError ? (
          <p className='text-destructive'>
            Failed to load applications. Please try again.
          </p>
        ) : (
          <MerchantApplicationsTable
            data={isLoading ? [] : (data?.applications ?? [])}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <MerchantApplicationsDialogs />
    </MerchantApplicationsProvider>
  )
}
