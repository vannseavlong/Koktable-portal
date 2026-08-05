import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Cuisine } from '../data/schema'

type CuisinesDialogType = 'create' | 'edit' | 'delete'

type CuisinesContextType = {
  open: CuisinesDialogType | null
  setOpen: (str: CuisinesDialogType | null) => void
  currentRow: Cuisine | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Cuisine | null>>
}

const CuisinesContext = React.createContext<CuisinesContextType | null>(null)

export function CuisinesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CuisinesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Cuisine | null>(null)

  return (
    <CuisinesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CuisinesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCuisinesContext = () => {
  const cuisinesContext = React.useContext(CuisinesContext)

  if (!cuisinesContext) {
    throw new Error('useCuisinesContext has to be used within <CuisinesContext>')
  }

  return cuisinesContext
}
