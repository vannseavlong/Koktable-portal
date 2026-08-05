import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useServices } from './services-provider'

export function ServicesPrimaryButtons() {
  const { setOpen } = useServices()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Add Service</span> <Plus size={18} />
      </Button>
    </div>
  )
}
