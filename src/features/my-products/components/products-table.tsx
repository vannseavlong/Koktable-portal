import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { useCategories } from '@/hooks/use-categories'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataTablePagination,
  DataTableToolbar,
  DataTableViewToggle,
  type DataTableViewMode,
} from '@/components/data-table'
import { updateProduct } from '../data/products-api'
import { type Product } from '../data/schema'
import { createProductsColumns } from './products-columns'
import { ProductsGrid } from './products-grid'

// Remembered per browser, not per account — same tradeoff as any other purely
// cosmetic UI preference in this app (e.g. column visibility isn't persisted either).
const VIEW_MODE_STORAGE_KEY = 'my-menu-view-mode'

function loadViewMode(): DataTableViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    return stored === 'grid' ? 'grid' : 'list'
  } catch {
    return 'list'
  }
}

type DataTableProps = {
  data: Product[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function ProductsTable({ data, search, navigate }: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [viewMode, setViewMode] = useState<DataTableViewMode>(loadViewMode)
  const queryClient = useQueryClient()
  const { categories } = useCategories()
  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.category_id, c])),
    [categories]
  )

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'search' },
    columnFilters: [
      { columnId: 'active', searchKey: 'active', type: 'array' },
      { columnId: 'category_id', searchKey: 'category', type: 'array' },
    ],
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (item: Product) =>
      updateProduct(item.item_id, { active: !item.active }),
    onSuccess: (_, item) => {
      toast.success(
        `"${item.name}" is now ${item.active ? 'inactive' : 'active'}.`
      )
      queryClient.invalidateQueries({ queryKey: ['my-products'] })
    },
    onError: (error) => handleServerError(error),
  })

  const columns = createProductsColumns({
    onToggleActive: (item) => toggleActiveMutation.mutate(item),
    isToggling: toggleActiveMutation.isPending,
    categoryNameById,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const term = filterValue.trim().toLowerCase()
      if (!term) return true
      const item = row.original as Product
      const categoryName =
        categoryNameById.get(item.category_id ?? '')?.name ?? ''
      return (
        item.name.toLowerCase().includes(term) ||
        categoryName.toLowerCase().includes(term)
      )
    },
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.category_id,
  }))

  function handleViewModeChange(mode: DataTableViewMode) {
    setViewMode(mode)
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
    } catch {
      // Best-effort only — a private window or blocked storage just means the
      // preference doesn't stick across reloads, not a broken page.
    }
  }

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by name or category...'
        filters={[
          {
            columnId: 'category_id',
            title: 'Category',
            options: categoryOptions,
          },
          {
            columnId: 'active',
            title: 'Status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
        viewToggle={
          <DataTableViewToggle
            value={viewMode}
            onChange={handleViewModeChange}
          />
        }
      />
      {viewMode === 'grid' ? (
        <ProductsGrid
          rows={table.getRowModel().rows}
          categoryNameById={categoryNameById}
          onToggleActive={(item) => toggleActiveMutation.mutate(item)}
          isToggling={toggleActiveMutation.isPending}
        />
      ) : (
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='group/row'>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted',
                        header.column.columnDef.meta?.className
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className='group/row'>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'bg-background group-hover/row:bg-muted',
                          cell.column.columnDef.meta?.className
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
