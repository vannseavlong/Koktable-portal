import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Category } from '../data/schema'

type CategoriesDialogType = 'create' | 'edit' | 'delete'

type CategoriesContextType = {
  open: CategoriesDialogType | null
  setOpen: (str: CategoriesDialogType | null) => void
  currentRow: Category | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Category | null>>
}

const CategoriesContext = React.createContext<CategoriesContextType | null>(
  null
)

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<CategoriesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Category | null>(null)

  return (
    <CategoriesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CategoriesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCategoriesContext = () => {
  const categoriesContext = React.useContext(CategoriesContext)

  if (!categoriesContext) {
    throw new Error(
      'useCategoriesContext has to be used within <CategoriesContext>'
    )
  }

  return categoriesContext
}
