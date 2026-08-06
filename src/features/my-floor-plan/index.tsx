import { useState } from 'react'
import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { FloorsPanel } from './components/floors-panel'
import { RoomsPanel } from './components/rooms-panel'
import { TablesPanel } from './components/tables-panel'

export function MyFloorPlan() {
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

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
          <h2 className='text-2xl font-bold tracking-tight'>Floor Plan</h2>
          <p className='text-muted-foreground'>
            Lay out your floors, rooms, and tables for table-based booking.
          </p>
        </div>

        <Alert>
          <Info />
          <AlertTitle>Running on preview data</AlertTitle>
          <AlertDescription>
            The floors/rooms/tables API hasn&apos;t shipped on the backend yet,
            so this page is wired to local mock data — changes here aren&apos;t
            saved and reset on reload. The UI is otherwise final; see
            Portal/TODO.md.
          </AlertDescription>
        </Alert>

        <div className='grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3'>
          <FloorsPanel
            selectedFloorId={selectedFloorId}
            onSelectFloor={(floorId) => {
              setSelectedFloorId(floorId)
              setSelectedRoomId(null)
            }}
          />
          <RoomsPanel
            floorId={selectedFloorId}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
          <TablesPanel roomId={selectedRoomId} />
        </div>
      </Main>
    </>
  )
}
