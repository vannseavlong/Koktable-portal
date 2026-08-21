import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type DataTableViewMode = 'list' | 'grid'

type DataTableViewToggleProps = {
  value: DataTableViewMode
  onChange: (value: DataTableViewMode) => void
}

// A small segmented control for switching a table between its row layout and a
// card-grid layout. Lives in data-table/ (not a feature folder) so any table that
// wants both views — not just My Menu — can reuse it without duplicating the markup.
export function DataTableViewToggle({
  value,
  onChange,
}: DataTableViewToggleProps) {
  return (
    <div className='inline-flex h-8 items-center rounded-md border p-0.5'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className={cn('size-7', value === 'list' && 'bg-muted hover:bg-muted')}
        aria-pressed={value === 'list'}
        aria-label='List view'
        onClick={() => onChange('list')}
      >
        <List className='size-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className={cn('size-7', value === 'grid' && 'bg-muted hover:bg-muted')}
        aria-pressed={value === 'grid'}
        aria-label='Grid view'
        onClick={() => onChange('grid')}
      >
        <LayoutGrid className='size-4' />
      </Button>
    </div>
  )
}
