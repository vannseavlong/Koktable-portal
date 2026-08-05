import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCatalogItems } from './catalog-items-provider'

export function CatalogItemsPrimaryButtons() {
  const { setOpen } = useCatalogItems()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Add Item</span> <Plus size={18} />
      </Button>
    </div>
  )
}
