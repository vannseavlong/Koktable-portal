import { useQuery } from '@tanstack/react-query'
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  PawPrint,
  PlayCircle,
  Users as UsersIcon,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchServices } from '@/features/content/data/services-api'
import { fetchReservations } from '@/features/orders/data/reservations-api'
import { type ReservationStatus } from '@/features/orders/data/schema'
import { fetchUsers } from '@/features/users/data/users-api'

const RESERVATION_STATUSES: {
  status: ReservationStatus
  label: string
  icon: typeof Clock
}[] = [
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: CalendarClock },
  { status: 'active', label: 'Active', icon: PlayCircle },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
  { status: 'cancelled', label: 'Cancelled', icon: XCircle },
]

function useReservationStatusCount(status: ReservationStatus) {
  return useQuery({
    queryKey: ['dashboard', 'reservations', status],
    queryFn: () => fetchReservations({ status, limit: 1 }),
    select: (data) => data.total,
  })
}

function StatCard({
  title,
  value,
  isLoading,
  icon: Icon,
}: {
  title: string
  value: number | undefined
  isLoading: boolean
  icon: typeof Clock
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>
          {isLoading ? '—' : (value ?? 0)}
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const reservationsTotalQuery = useQuery({
    queryKey: ['dashboard', 'reservations', 'total'],
    queryFn: () => fetchReservations({ limit: 1 }),
    select: (data) => data.total,
  })

  const pendingQuery = useReservationStatusCount('pending')
  const confirmedQuery = useReservationStatusCount('confirmed')
  const activeQuery = useReservationStatusCount('active')
  const completedQuery = useReservationStatusCount('completed')
  const cancelledQuery = useReservationStatusCount('cancelled')

  const statusQueries = {
    pending: pendingQuery,
    confirmed: confirmedQuery,
    active: activeQuery,
    completed: completedQuery,
    cancelled: cancelledQuery,
  }

  const servicesQuery = useQuery({
    queryKey: ['dashboard', 'services'],
    queryFn: () => fetchServices(),
    select: (data) => ({
      total: data.services.length,
      active: data.services.filter((s) => s.active).length,
    }),
  })

  const usersTotalQuery = useQuery({
    queryKey: ['dashboard', 'users', 'total'],
    queryFn: () => fetchUsers({ limit: 1 }),
    select: (data) => data.total,
  })

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            title='Total Reservations'
            value={reservationsTotalQuery.data}
            isLoading={reservationsTotalQuery.isLoading}
            icon={CalendarClock}
          />
          <StatCard
            title='Active Services'
            value={servicesQuery.data?.active}
            isLoading={servicesQuery.isLoading}
            icon={PawPrint}
          />
          <StatCard
            title='Total Services'
            value={servicesQuery.data?.total}
            isLoading={servicesQuery.isLoading}
            icon={PawPrint}
          />
          <StatCard
            title='Total Users'
            value={usersTotalQuery.data}
            isLoading={usersTotalQuery.isLoading}
            icon={UsersIcon}
          />
        </div>

        <div className='mt-4'>
          <h2 className='mb-2 text-lg font-semibold tracking-tight'>
            Reservations by status
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {RESERVATION_STATUSES.map(({ status, label, icon }) => (
              <StatCard
                key={status}
                title={label}
                value={statusQueries[status].data}
                isLoading={statusQueries[status].isLoading}
                icon={icon}
              />
            ))}
          </div>
        </div>
      </Main>
    </>
  )
}
