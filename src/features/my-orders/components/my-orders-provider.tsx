import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Order, type OrderStatus } from '../data/schema'

type MyOrdersDialogType = 'detail' | 'status'

type MyOrdersContextType = {
  open: MyOrdersDialogType | null
  setOpen: (str: MyOrdersDialogType | null) => void
  currentRow: Order | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Order | null>>
  targetStatus: OrderStatus | null
  setTargetStatus: React.Dispatch<React.SetStateAction<OrderStatus | null>>
}

const MyOrdersContext = React.createContext<MyOrdersContextType | null>(null)

export function MyOrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<MyOrdersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Order | null>(null)
  const [targetStatus, setTargetStatus] = useState<OrderStatus | null>(null)

  return (
    <MyOrdersContext
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
    </MyOrdersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMyOrders = () => {
  const myOrdersContext = React.useContext(MyOrdersContext)

  if (!myOrdersContext) {
    throw new Error('useMyOrders has to be used within <MyOrdersContext>')
  }

  return myOrdersContext
}
