import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type CatalogItem } from '../data/schema'

type CatalogItemsDialogType = 'create' | 'edit' | 'delete'

type CatalogItemsContextType = {
  open: CatalogItemsDialogType | null
  setOpen: (str: CatalogItemsDialogType | null) => void
  currentRow: CatalogItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CatalogItem | null>>
}

const CatalogItemsContext = React.createContext<CatalogItemsContextType | null>(
  null
)

export function CatalogItemsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<CatalogItemsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CatalogItem | null>(null)

  return (
    <CatalogItemsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CatalogItemsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCatalogItems = () => {
  const catalogItemsContext = React.useContext(CatalogItemsContext)

  if (!catalogItemsContext) {
    throw new Error(
      'useCatalogItems has to be used within <CatalogItemsContext>'
    )
  }

  return catalogItemsContext
}
