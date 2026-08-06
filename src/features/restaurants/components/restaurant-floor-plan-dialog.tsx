import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  fetchFloors,
  fetchRooms,
  fetchTables,
} from '@/features/my-floor-plan/data/floor-plan-api'
import { type Floor, type Room } from '@/features/my-floor-plan/data/schema'
import { type Restaurant } from '../data/schema'

// Admin's read-only counterpart to the merchant `my-floor-plan` feature (see
// Portal/TODO.md item 1) — no edit/deactivate here, admins just need visibility into
// how a restaurant has laid out its floors/rooms/tables. Reads through the same mock
// `floor-plan-api` module the merchant page uses (no `/admin/floors` route exists
// either yet); since that mock only knows a single seeded restaurant, this shows the
// same preview data regardless of which restaurant row it's opened from — swap for a
// real `restaurant_id`-scoped admin fetch once the backend ships.

type RestaurantFloorPlanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Restaurant
}

export function RestaurantFloorPlanDialog({
  open,
  onOpenChange,
  currentRow,
}: RestaurantFloorPlanDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['floor-plan-floors'],
    queryFn: fetchFloors,
    enabled: open,
  })
  const floors = data?.floors ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Floor Plan — {currentRow.name}</DialogTitle>
          <DialogDescription>
            Read-only view of this restaurant&apos;s floors, rooms, and tables.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTitle>Preview data</AlertTitle>
          <AlertDescription>
            The floors/rooms/tables API hasn&apos;t shipped yet — this is the
            same mock data the merchant Floor Plan page uses, not this
            restaurant&apos;s actual layout.
          </AlertDescription>
        </Alert>

        <ScrollArea className='max-h-[55vh]'>
          <div className='space-y-2 pe-3'>
            {!isLoading && floors.length === 0 && (
              <p className='py-6 text-center text-sm text-muted-foreground'>
                No floors set up yet.
              </p>
            )}
            {floors.map((floor) => (
              <FloorRow key={floor.floor_id} floor={floor} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function FloorRow({ floor }: { floor: Floor }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['floor-plan-rooms', floor.floor_id],
    queryFn: () => fetchRooms(floor.floor_id),
    enabled: open,
  })
  const rooms = data?.rooms ?? []

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='rounded-md border'
    >
      <CollapsibleTrigger className='flex w-full items-center justify-between gap-3 p-3 text-start'>
        <div className='flex min-w-0 items-center gap-2 font-medium'>
          <ChevronRight
            className={cn(
              'size-4 shrink-0 transition-transform',
              open && 'rotate-90'
            )}
          />
          {floor.name}
          {!floor.active && <Badge variant='secondary'>Inactive</Badge>}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className='space-y-2 border-t p-3 ps-9'>
        {!isLoading && rooms.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            No rooms on this floor.
          </p>
        )}
        {rooms.map((room) => (
          <RoomRow key={room.room_id} room={room} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function RoomRow({ room }: { room: Room }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['floor-plan-tables', room.room_id],
    queryFn: () => fetchTables(room.room_id),
    enabled: open,
  })
  const tables = data?.tables ?? []

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='rounded-md border'
    >
      <CollapsibleTrigger className='flex w-full items-center justify-between gap-3 p-2.5 text-start'>
        <div className='flex min-w-0 items-center gap-2 text-sm font-medium'>
          <ChevronRight
            className={cn(
              'size-4 shrink-0 transition-transform',
              open && 'rotate-90'
            )}
          />
          {room.name}
          {!room.active && <Badge variant='secondary'>Inactive</Badge>}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className='space-y-1.5 border-t p-2.5 ps-8'>
        {!isLoading && tables.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            No tables in this room.
          </p>
        )}
        {tables.map((table) => (
          <div
            key={table.table_id}
            className='flex items-center justify-between gap-2 text-sm'
          >
            <span className='font-medium'>{table.label}</span>
            <span className='flex items-center gap-1 text-muted-foreground capitalize'>
              <Users className='size-3.5' />
              {table.seats} seats · {table.shape}
              {!table.active && <Badge variant='secondary'>Inactive</Badge>}
            </span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
