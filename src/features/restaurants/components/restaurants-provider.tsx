import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Restaurant, type RestaurantStatus } from '../data/schema'

type RestaurantsDialogType = 'detail' | 'status' | 'locations'

type RestaurantsContextType = {
  open: RestaurantsDialogType | null
  setOpen: (str: RestaurantsDialogType | null) => void
  currentRow: Restaurant | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Restaurant | null>>
  targetStatus: RestaurantStatus | null
  setTargetStatus: React.Dispatch<React.SetStateAction<RestaurantStatus | null>>
}

const RestaurantsContext = React.createContext<RestaurantsContextType | null>(null)

export function RestaurantsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RestaurantsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Restaurant | null>(null)
  const [targetStatus, setTargetStatus] = useState<RestaurantStatus | null>(null)

  return (
    <RestaurantsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        targetStatus,
        setTargetStatus,
      }}
    >
      {children}
    </RestaurantsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRestaurants = () => {
  const restaurantsContext = React.useContext(RestaurantsContext)

  if (!restaurantsContext) {
    throw new Error('useRestaurants has to be used within <RestaurantsContext>')
  }

  return restaurantsContext
}
