import {
  Clock,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  SquarePen,
  Store,
  Utensils,
} from 'lucide-react'
import { toDisplayImageUrl } from '@/lib/drive-image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type DayOfWeek, formatDayHours } from '@/features/restaurants/data/hours-schema'
import { type Restaurant } from '../data/schema'

// Date#getDay(): 0 = Sunday.
const jsDayToDayOfWeek: DayOfWeek[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
]

const statusStyles: Record<Restaurant['status'], string> = {
  pending:
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300',
  active: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  suspended: 'bg-neutral-300/40 border-neutral-300',
}

type RestaurantProfilePreviewProps = {
  restaurant: Restaurant
  onEdit: () => void
  onEditHours: () => void
  onEditLocation: () => void
  onEditCuisines: () => void
}

// Read-only storefront-style header — the counterpart to the always-editable
// form this page used to render. Edit opens `RestaurantEditDialog` instead.
export function RestaurantProfilePreview({ restaurant, onEdit, onEditHours, onEditLocation, onEditCuisines }: RestaurantProfilePreviewProps) {
  const today = restaurant.hours.find((d) => d.day_of_week === jsDayToDayOfWeek[new Date().getDay()])
  return (
    <Card className='overflow-hidden py-0'>
      <div className='relative h-36 w-full bg-gradient-to-br from-teal-100 to-emerald-50 sm:h-52 dark:from-teal-950 dark:to-emerald-950'>
        {restaurant.banner && (
          <img
            src={toDisplayImageUrl(restaurant.banner)}
            alt=''
            className='h-full w-full object-cover'
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='secondary'
              size='icon'
              className='absolute top-3 right-3'
            >
              <MoreVertical />
              <span className='sr-only'>Restaurant actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={onEdit}>
              <SquarePen /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditHours}>
              <Clock /> Edit hours
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditLocation}>
              <MapPin /> Edit location
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditCuisines}>
              <Utensils /> Edit cuisines
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className='relative pb-6'>
        <Avatar className='absolute -top-10 size-20 border-4 border-background shadow-sm sm:-top-12 sm:size-24'>
          <AvatarImage src={toDisplayImageUrl(restaurant.logo)} alt={restaurant.name} />
          <AvatarFallback>
            <Store className='size-8 text-muted-foreground' />
          </AvatarFallback>
        </Avatar>

        <div className='flex flex-col gap-4 pt-12 sm:pt-14'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-xl font-bold tracking-tight'>{restaurant.name}</h2>
            <Badge
              variant='outline'
              className={statusStyles[restaurant.status] + ' capitalize'}
            >
              {restaurant.status}
            </Badge>
          </div>

          {restaurant.description && (
            <p className='max-w-2xl text-muted-foreground'>
              {restaurant.description}
            </p>
          )}

          <div className='flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-6'>
            {restaurant.location?.contact_email && (
              <span className='flex items-center gap-2 text-muted-foreground'>
                <Mail className='size-4' /> {restaurant.location.contact_email}
              </span>
            )}
            {restaurant.location?.contact_phone && (
              <span className='flex items-center gap-2 text-muted-foreground'>
                <Phone className='size-4' /> {restaurant.location.contact_phone}
              </span>
            )}
            {today && (
              <span className='flex items-start gap-2 text-muted-foreground'>
                <Clock className='size-4 shrink-0 translate-y-0.5' />{' '}
                Today: {formatDayHours(today)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
