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
import { fetchFloors, updateFloor } from '../data/floor-plan-api'
import { type Floor } from '../data/schema'
import { FloorMutateDialog } from './floor-mutate-dialog'

type FloorsPanelProps = {
  selectedFloorId: string | null
  onSelectFloor: (floorId: string) => void
}

export function FloorsPanel({
  selectedFloorId,
  onSelectFloor,
}: FloorsPanelProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['floor-plan-floors'],
    queryFn: fetchFloors,
  })
  const floors = data?.floors ?? []

  const [mutateOpen, setMutateOpen] = useState(false)
  const [editingFloor, setEditingFloor] = useState<Floor | undefined>(undefined)
  const [deactivateTarget, setDeactivateTarget] = useState<Floor | null>(null)

  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: ({ floor, active }: { floor: Floor; active: boolean }) =>
      updateFloor(floor.floor_id, { active }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.active ? 'Floor reactivated.' : 'Floor deactivated.'
      )
      queryClient.invalidateQueries({ queryKey: ['floor-plan-floors'] })
      setDeactivateTarget(null)
    },
    onError: (error) => handleServerError(error),
  })

  const openAddDialog = () => {
    setEditingFloor(undefined)
    setMutateOpen(true)
  }
  const openEditDialog = (floor: Floor) => {
    setEditingFloor(floor)
    setMutateOpen(true)
  }

  return (
    <Card className='flex min-h-0 flex-1 flex-col'>
      <CardHeader>
        <CardTitle>Floors</CardTitle>
        <CardAction>
          <Button variant='outline' size='sm' onClick={openAddDialog}>
            <Plus className='size-4' /> Add
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='min-h-0 flex-1'>
        <ScrollArea className='h-full max-h-[60vh]'>
          <div className='space-y-2 pe-3'>
            {!isLoading && floors.length === 0 && (
              <p className='py-6 text-center text-sm text-muted-foreground'>
                No floors yet. Add one to start laying out your restaurant.
              </p>
            )}
            {floors.map((floor) => {
              const isActive = floor.active
              const isSelected = floor.floor_id === selectedFloorId
              return (
                <div
                  key={floor.floor_id}
                  role='button'
                  tabIndex={0}
                  onClick={() => onSelectFloor(floor.floor_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      onSelectFloor(floor.floor_id)
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
                      {floor.name}
                      {!isActive && <Badge variant='secondary'>Inactive</Badge>}
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
                      onClick={() => openEditDialog(floor)}
                    >
                      <SquarePen className='size-4' />
                    </Button>
                    {isActive ? (
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={isToggling}
                        onClick={() => setDeactivateTarget(floor)}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={isToggling}
                        onClick={() => toggleActive({ floor, active: true })}
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
      </CardContent>

      <FloorMutateDialog
        key={editingFloor?.floor_id ?? 'new'}
        currentRow={editingFloor}
        open={mutateOpen}
        onOpenChange={setMutateOpen}
      />

      {deactivateTarget && (
        <ConfirmDialog
          open={!!deactivateTarget}
          onOpenChange={(state) => !state && setDeactivateTarget(null)}
          title={`Deactivate ${deactivateTarget.name || 'this floor'}?`}
          desc='This hides the floor (and its rooms/tables) from booking without deleting it. You can reactivate it later.'
          confirmText='Deactivate'
          destructive
          isLoading={isToggling}
          handleConfirm={() =>
            toggleActive({ floor: deactivateTarget, active: false })
          }
        />
      )}
    </Card>
  )
}
