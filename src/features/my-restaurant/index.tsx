import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RestaurantCuisinesDialog } from './components/restaurant-cuisines-dialog'
import { RestaurantEditDialog } from './components/restaurant-edit-dialog'
import { RestaurantHoursDialog } from './components/restaurant-hours-dialog'
import { RestaurantLocationDialog } from './components/restaurant-location-dialog'
import { RestaurantProfilePreview } from './components/restaurant-profile-preview'
import { fetchMyRestaurant } from './data/restaurant-api'

export function MyRestaurant() {
  const [editOpen, setEditOpen] = useState(false)
  const [hoursOpen, setHoursOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [cuisinesOpen, setCuisinesOpen] = useState(false)
  // Bumped on every Edit click to force a fresh `RestaurantEditDialog` mount (fresh
  // form/image state from the current `restaurant`, no stale edits from last time).
  const [editKey, setEditKey] = useState(0)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-restaurant'],
    queryFn: () => fetchMyRestaurant(),
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>My Restaurant</h2>
          <p className='text-muted-foreground'>
            Preview of the storefront details customers see in the mobile app.
          </p>
        </div>

        {isError && (
          <p className='text-destructive'>
            Failed to load your restaurant. Please try again.
          </p>
        )}
        {isLoading && (
          <p className='text-muted-foreground'>Loading your restaurant…</p>
        )}
        {data?.restaurant && (
          <>
            <RestaurantProfilePreview
              restaurant={data.restaurant}
              onEdit={() => {
                setEditKey((k) => k + 1)
                setEditOpen(true)
              }}
              onEditHours={() => setHoursOpen(true)}
              onEditLocation={() => setLocationOpen(true)}
              onEditCuisines={() => setCuisinesOpen(true)}
            />
            <RestaurantEditDialog
              key={editKey}
              restaurant={data.restaurant}
              open={editOpen}
              onOpenChange={setEditOpen}
            />
            <RestaurantHoursDialog
              restaurant={data.restaurant}
              open={hoursOpen}
              onOpenChange={setHoursOpen}
            />
            <RestaurantLocationDialog
              restaurant={data.restaurant}
              open={locationOpen}
              onOpenChange={setLocationOpen}
            />
            <RestaurantCuisinesDialog
              restaurant={data.restaurant}
              open={cuisinesOpen}
              onOpenChange={setCuisinesOpen}
            />
          </>
        )}
      </Main>
    </>
  )
}
