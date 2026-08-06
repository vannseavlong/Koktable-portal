import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, SquarePen } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { fetchRooms, updateRoom } from '../data/floor-plan-api'
import { type Room } from '../data/schema'
import { RoomMutateDialog } from './room-mutate-dialog'

type RoomsPanelProps = {
  floorId: string | null
  selectedRoomId: string | null
  onSelectRoom: (roomId: string) => void
}

export function RoomsPanel({
  floorId,
  selectedRoomId,
  onSelectRoom,
}: RoomsPanelProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['floor-plan-rooms', floorId],
    queryFn: () => fetchRooms(floorId!),
    enabled: !!floorId,
  })
  const rooms = data?.rooms ?? []

  const [mutateOpen, setMutateOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined)
  const [deactivateTarget, setDeactivateTarget] = useState<Room | null>(null)

  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: ({ room, active }: { room: Room; active: boolean }) =>
      updateRoom(room.room_id, { active }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.active ? 'Room reactivated.' : 'Room deactivated.'
      )
      queryClient.invalidateQueries({ queryKey: ['floor-plan-rooms', floorId] })
      setDeactivateTarget(null)
    },
    onError: (error) => handleServerError(error),
  })

  const openAddDialog = () => {
    setEditingRoom(undefined)
    setMutateOpen(true)
  }
  const openEditDialog = (room: Room) => {
    setEditingRoom(room)
    setMutateOpen(true)
  }

  return (
    <Card className='flex min-h-0 flex-1 flex-col'>
      <CardHeader>
        <CardTitle>Rooms</CardTitle>
        <CardAction>
          <Button
            variant='outline'
            size='sm'
            disabled={!floorId}
            onClick={openAddDialog}
          >
            <Plus className='size-4' /> Add
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='min-h-0 flex-1'>
        {!floorId ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            Select a floor to manage its rooms.
          </p>
        ) : (
          <ScrollArea className='h-full max-h-[60vh]'>
            <div className='space-y-2 pe-3'>
              {!isLoading && rooms.length === 0 && (
                <p className='py-6 text-center text-sm text-muted-foreground'>
                  No rooms on this floor yet.
                </p>
              )}
              {rooms.map((room) => {
                const isActive = room.active
                const isSelected = room.room_id === selectedRoomId
                return (
                  <div
                    key={room.room_id}
                    role='button'
                    tabIndex={0}
                    onClick={() => onSelectRoom(room.room_id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        onSelectRoom(room.room_id)
                    }}
                    className={cn(
                      'flex cursor-pointer items-start justify-between gap-3 rounded-md border p-3 transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2 font-medium'>
                        {room.name}
                        {!isActive && (
                          <Badge variant='secondary'>Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div
                      className='flex shrink-0 items-center gap-2'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-8'
                        onClick={() => openEditDialog(room)}
                      >
                        <SquarePen className='size-4' />
                      </Button>
                      {isActive ? (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={isToggling}
                          onClick={() => setDeactivateTarget(room)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={isToggling}
                          onClick={() => toggleActive({ room, active: true })}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {floorId && (
        <RoomMutateDialog
          key={editingRoom?.room_id ?? 'new'}
          floorId={floorId}
          currentRow={editingRoom}
          open={mutateOpen}
          onOpenChange={setMutateOpen}
        />
      )}

      {deactivateTarget && (
        <ConfirmDialog
          open={!!deactivateTarget}
          onOpenChange={(state) => !state && setDeactivateTarget(null)}
          title={`Deactivate ${deactivateTarget.name || 'this room'}?`}
          desc='This hides the room (and its tables) from booking without deleting it. You can reactivate it later.'
          confirmText='Deactivate'
          destructive
          isLoading={isToggling}
          handleConfirm={() =>
            toggleActive({ room: deactivateTarget, active: false })
          }
        />
      )}
    </Card>
  )
}
