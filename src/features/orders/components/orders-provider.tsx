import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Reservation, type ReservationStatus } from '../data/schema'

type OrdersDialogType = 'detail' | 'status'

type OrdersContextType = {
  open: OrdersDialogType | null
  setOpen: (str: OrdersDialogType | null) => void
  currentRow: Reservation | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Reservation | null>>
  targetStatus: ReservationStatus | null
  setTargetStatus: React.Dispatch<React.SetStateAction<ReservationStatus | null>>
}

const OrdersContext = React.createContext<OrdersContextType | null>(null)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<OrdersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Reservation | null>(null)
  const [targetStatus, setTargetStatus] = useState<ReservationStatus | null>(null)

  return (
    <OrdersContext
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
    </OrdersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const ordersContext = React.useContext(OrdersContext)

  if (!ordersContext) {
    throw new Error('useOrders has to be used within <OrdersContext>')
  }

  return ordersContext
}
