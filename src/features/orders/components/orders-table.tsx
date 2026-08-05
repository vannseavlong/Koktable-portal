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
import { useRestaurants } from '@/hooks/use-restaurants'
import { statusOptions } from '../data/data'
import { type Reservation } from '../data/schema'
import { createOrdersColumns } from './orders-columns'

type DataTableProps = {
  data: Reservation[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function OrdersTable({ data, search, navigate }: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const { restaurants } = useRestaurants()

  const restaurantNameById = useMemo(
    () => new Map(restaurants.map((r) => [r.restaurant_id, r.name])),
    [restaurants]
  )

  const columns = useMemo(
    () => createOrdersColumns({ restaurantNameById }),
    [restaurantNameById]
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
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'restaurant', searchKey: 'restaurant', type: 'array' },
    ],
  })

  const restaurantOptions = useMemo(() => {
    const ids = new Set(
      data.map((r) => r.restaurant_id).filter((id): id is string => !!id)
    )
    return Array.from(ids)
      .map((id) => ({ label: restaurantNameById.get(id) ?? id, value: id }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data, restaurantNameById])

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
      const reservation = row.original as Reservation
      const restaurantName = reservation.restaurant_id
        ? (restaurantNameById.get(reservation.restaurant_id) ?? '')
        : ''
      return (
        reservation.guest_name.toLowerCase().includes(term) ||
        reservation.service_name.toLowerCase().includes(term) ||
        reservation.user_name.toLowerCase().includes(term) ||
        reservation.user_email.toLowerCase().includes(term) ||
        reservation.reservation_id.toLowerCase().includes(term) ||
        restaurantName.toLowerCase().includes(term)
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
        searchPlaceholder='Search by guest, service, restaurant, or owner...'
        filters={[
          {
            columnId: 'restaurant',
            title: 'Restaurant',
            options: restaurantOptions,
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
