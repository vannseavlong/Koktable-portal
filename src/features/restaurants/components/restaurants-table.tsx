import { useEffect, useMemo, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { statusOptions } from '../data/data'
import { type Restaurant } from '../data/schema'
import { restaurantsColumns as columns } from './restaurants-columns'

type DataTableProps = {
  data: Restaurant[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function RestaurantsTable({ data, search, navigate }: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

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
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'city', searchKey: 'city', type: 'array' },
      { columnId: 'cuisine', searchKey: 'cuisine', type: 'array' },
    ],
  })

  const cityOptions = useMemo(() => {
    const cities = new Set(data.map((r) => r.city).filter((c): c is string => !!c))
    return Array.from(cities)
      .sort()
      .map((city) => ({ label: city, value: city }))
  }, [data])

  const cuisineOptions = useMemo(() => {
    const cuisines = new Set(data.flatMap((r) => r.cuisine ?? []))
    return Array.from(cuisines)
      .sort()
      .map((cuisine) => ({ label: cuisine, value: cuisine }))
  }, [data])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const term = filterValue.trim().toLowerCase()
      if (!term) return true
      const restaurant = row.original as Restaurant
      return (
        restaurant.name.toLowerCase().includes(term) ||
        (restaurant.contact_email ?? '').toLowerCase().includes(term) ||
        restaurant.owner_user_id.toLowerCase().includes(term) ||
        (restaurant.address ?? '').toLowerCase().includes(term) ||
        (restaurant.city ?? '').toLowerCase().includes(term)
      )
    },
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by restaurant, owner, or address...'
        filters={[
          {
            columnId: 'city',
            title: 'City',
            options: cityOptions,
          },
          {
            columnId: 'cuisine',
            title: 'Cuisine',
            options: cuisineOptions,
          },
          {
            columnId: 'status',
            title: 'Status',
            options: statusOptions,
          },
        ]}
      />
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
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
