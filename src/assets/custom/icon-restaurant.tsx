import { type SVGProps } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { RestaurantIcon as HugeRestaurantIcon } from '@hugeicons/core-free-icons'

/** Hugeicons "Restaurant" glyph, wrapped to the plain SVGProps shape the sidebar nav expects. */
export function IconRestaurant(props: Omit<SVGProps<SVGSVGElement>, 'strokeWidth'>) {
  return <HugeiconsIcon icon={HugeRestaurantIcon} data-name='icon-restaurant' {...props} />
}
