import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, SquarePen, Users } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
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
import { fetchTables, updateTable } from '../data/floor-plan-api'
import { type RestaurantTable } from '../data/schema'
import { TableMutateDialog } from './table-mutate-dialog'

type TablesPanelProps = {
  roomId: string | null
}

export function TablesPanel({ roomId }: TablesPanelProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['floor-plan-tables', roomId],
    queryFn: () => fetchTables(roomId!),
    enabled: !!roomId,
  })
  const tables = data?.tables ?? []

  const [mutateOpen, setMutateOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<RestaurantTable | undefined>(
    undefined
  )
  const [deactivateTarget, setDeactivateTarget] =
    useState<RestaurantTable | null>(null)

  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: ({
      table,
      active,
    }: {
      table: RestaurantTable
      active: boolean
    }) => updateTable(table.table_id, { active }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.active ? 'Table reactivated.' : 'Table deactivated.'
      )
      queryClient.invalidateQueries({ queryKey: ['floor-plan-tables', roomId] })
      setDeactivateTarget(null)
    },
    onError: (error) => handleServerError(error),
  })

  const openAddDialog = () => {
    setEditingTable(undefined)
    setMutateOpen(true)
  }
  const openEditDialog = (table: RestaurantTable) => {
    setEditingTable(table)
    setMutateOpen(true)
  }

  return (
    <Card className='flex min-h-0 flex-1 flex-col'>
      <CardHeader>
        <CardTitle>Tables</CardTitle>
        <CardAction>
          <Button
            variant='outline'
            size='sm'
            disabled={!roomId}
            onClick={openAddDialog}
          >
            <Plus className='size-4' /> Add
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='min-h-0 flex-1'>
        {!roomId ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            Select a room to manage its tables.
          </p>
        ) : (
          <ScrollArea className='h-full max-h-[60vh]'>
            <div className='space-y-2 pe-3'>
              {!isLoading && tables.length === 0 && (
                <p className='py-6 text-center text-sm text-muted-foreground'>
                  No tables in this room yet.
                </p>
              )}
              {tables.map((table) => {
                const isActive = table.active
                return (
                  <div
                    key={table.table_id}
                    className='flex items-start justify-between gap-3 rounded-md border p-3'
                  >
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2 font-medium'>
                        {table.label}
                        {!isActive && (
                          <Badge variant='secondary'>Inactive</Badge>
                        )}
                      </div>
                      <p className='flex items-center gap-1 text-sm text-muted-foreground capitalize'>
                        <Users className='size-3.5' />
                        {table.seats} seats · {table.shape}
                      </p>
                    </div>
                    <div className='flex shrink-0 items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-8'
                        onClick={() => openEditDialog(table)}
                      >
                        <SquarePen className='size-4' />
                      </Button>
                      {isActive ? (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={isToggling}
                          onClick={() => setDeactivateTarget(table)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={isToggling}
                          onClick={() => toggleActive({ table, active: true })}
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

      {roomId && (
        <TableMutateDialog
          key={editingTable?.table_id ?? 'new'}
          roomId={roomId}
          currentRow={editingTable}
          open={mutateOpen}
          onOpenChange={setMutateOpen}
        />
      )}

      {deactivateTarget && (
        <ConfirmDialog
          open={!!deactivateTarget}
          onOpenChange={(state) => !state && setDeactivateTarget(null)}
          title={`Deactivate table ${deactivateTarget.label || ''}?`}
          desc='This hides the table from booking without deleting it. You can reactivate it later.'
          confirmText='Deactivate'
          destructive
          isLoading={isToggling}
          handleConfirm={() =>
            toggleActive({ table: deactivateTarget, active: false })
          }
        />
      )}
    </Card>
  )
}
