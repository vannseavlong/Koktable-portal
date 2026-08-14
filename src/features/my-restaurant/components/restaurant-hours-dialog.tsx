import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  DAYS_OF_WEEK,
  dayLabel,
  type DayHours,
  type DayOfWeek,
} from '@/features/restaurants/data/hours-schema'
import { updateMyRestaurantHours } from '../data/restaurant-api'
import { type Restaurant } from '../data/schema'

const defaultPeriod = { open: '09:00', close: '17:00' }

function toEditableDays(restaurant: Restaurant): DayHours[] {
  const byDay = new Map(restaurant.hours.map((d) => [d.day_of_week, d]))
  return DAYS_OF_WEEK.map(
    (day_of_week) =>
      byDay.get(day_of_week) ?? {
        day_of_week,
        closed: true,
        open_24h: false,
        periods: [],
      }
  )
}

type DayRowProps = {
  day: DayHours
  onChange: (day: DayHours) => void
}

function DayRow({ day, onChange }: DayRowProps) {
  const setPeriod = (
    index: number,
    patch: Partial<{ open: string; close: string }>
  ) => {
    const periods = day.periods.map((p, i) =>
      i === index ? { ...p, ...patch } : p
    )
    onChange({ ...day, periods })
  }

  return (
    <div className='space-y-2 border-b py-3 last:border-b-0'>
      <div className='flex items-center justify-between'>
        <span className='w-24 shrink-0 font-medium'>
          {dayLabel(day.day_of_week)}
        </span>
        <div className='flex items-center gap-4 text-sm'>
          <label className='flex items-center gap-2'>
            <Switch
              checked={day.closed}
              onCheckedChange={(closed) =>
                onChange({
                  ...day,
                  closed,
                  open_24h: closed ? false : day.open_24h,
                })
              }
            />
            Closed
          </label>
          <label className='flex items-center gap-2'>
            <Switch
              checked={day.open_24h}
              disabled={day.closed}
              onCheckedChange={(open_24h) => onChange({ ...day, open_24h })}
            />
            Open 24h
          </label>
        </div>
      </div>

      {!day.closed && !day.open_24h && (
        <div className='space-y-2'>
          {day.periods.map((period, index) => (
            <div key={index} className='flex items-center gap-2'>
              <Input
                type='time'
                value={period.open}
                onChange={(e) => setPeriod(index, { open: e.target.value })}
                className='w-32'
              />
              <span className='text-muted-foreground'>–</span>
              <Input
                type='time'
                value={period.close}
                onChange={(e) => setPeriod(index, { close: e.target.value })}
                className='w-32'
              />
              {day.periods.length > 1 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() =>
                    onChange({
                      ...day,
                      periods: day.periods.filter((_, i) => i !== index),
                    })
                  }
                >
                  <X />
                </Button>
              )}
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              onChange({
                ...day,
                periods: [...day.periods, { ...defaultPeriod }],
              })
            }
          >
            <Plus /> {day.periods.length > 0 ? 'Add split shift' : 'Add hours'}
          </Button>
        </div>
      )}
    </div>
  )
}

type RestaurantHoursDialogProps = {
  restaurant: Restaurant
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestaurantHoursDialog({
  restaurant,
  open,
  onOpenChange,
}: RestaurantHoursDialogProps) {
  const queryClient = useQueryClient()
  const [days, setDays] = useState<DayHours[]>(() => toEditableDays(restaurant))

  const setDay = (index: number, day: DayHours) =>
    setDays((prev) => prev.map((d, i) => (i === index ? day : d)))

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateMyRestaurantHours(days),
    onSuccess: (data) => {
      toast.success('Hours updated.')
      queryClient.setQueryData(
        ['my-restaurant'],
        (current: { restaurant: Restaurant } | undefined) =>
          current
            ? { restaurant: { ...current.restaurant, hours: data.hours } }
            : current
      )
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const invalid = days.some(
    (d) => !d.closed && !d.open_24h && d.periods.length === 0
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDays(toEditableDays(restaurant))
        onOpenChange(next)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Weekly hours</DialogTitle>
          <DialogDescription>
            Set your opening hours for each day. Saving replaces the full week.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto pe-3'>
          {days.map((day, index) => (
            <DayRow
              key={day.day_of_week satisfies DayOfWeek}
              day={day}
              onChange={(d) => setDay(index, d)}
            />
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => mutate()} disabled={isPending || invalid}>
            Save hours
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
