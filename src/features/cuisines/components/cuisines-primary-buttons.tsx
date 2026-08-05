import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCuisinesContext } from './cuisines-provider'

export function CuisinesPrimaryButtons() {
  const { setOpen } = useCuisinesContext()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Add Cuisine</span> <Plus size={18} />
      </Button>
    </div>
  )
}
