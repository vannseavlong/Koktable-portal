import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type MerchantApplication } from '../data/schema'

type MerchantApplicationsDialogType = 'detail' | 'approve' | 'reject' | 'resend'

type MerchantApplicationsContextType = {
  open: MerchantApplicationsDialogType | null
  setOpen: (str: MerchantApplicationsDialogType | null) => void
  currentRow: MerchantApplication | null
  setCurrentRow: React.Dispatch<
    React.SetStateAction<MerchantApplication | null>
  >
}

const MerchantApplicationsContext =
  React.createContext<MerchantApplicationsContextType | null>(null)

export function MerchantApplicationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<MerchantApplicationsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MerchantApplication | null>(null)

  return (
    <MerchantApplicationsContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </MerchantApplicationsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMerchantApplications = () => {
  const context = React.useContext(MerchantApplicationsContext)

  if (!context) {
    throw new Error(
      'useMerchantApplications has to be used within <MerchantApplicationsContext>'
    )
  }

  return context
}
