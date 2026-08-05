import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { fetchCategories } from '@/features/categories/data/categories-api'
import { type Service } from '../data/schema'
import { reorderServices, updateService } from '../data/services-api'
import { createServicesColumns } from './services-columns'

type DataTableProps = {
  data: Service[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function ServicesTable({ data, search, navigate }: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const queryClient = useQueryClient()

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  })
  const categories = useMemo(
    () => categoriesData?.categories ?? [],
    [categoriesData]
  )
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
      { columnId: 'category_id', searchKey: 'category_id', type: 'array' },
      { columnId: 'active', searchKey: 'active', type: 'array' },
    ],
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (service: Service) =>
      updateService(service.service_id, { active: !service.active }),
    onSuccess: (_, service) => {
      toast.success(
        `"${service.name}" is now ${service.active ? 'inactive' : 'active'}.`
      )
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error) => handleServerError(error),
  })

  const reorderMutation = useMutation({
    mutationFn: (order: string[]) => reorderServices(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error) => handleServerError(error),
  })

  const move = (service: Service, direction: 'up' | 'down') => {
    const index = data.findIndex((s) => s.service_id === service.service_id)
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || swapWith < 0 || swapWith >= data.length) return

    const reordered = [...data]
    ;[reordered[index], reordered[swapWith]] = [
      reordered[swapWith],
      reordered[index],
    ]
    reorderMutation.mutate(reordered.map((s) => s.service_id))
  }

  const columns = createServicesColumns({
    onToggleActive: (service) => toggleActiveMutation.mutate(service),
    onMoveUp: (service) => move(service, 'up'),
    onMoveDown: (service) => move(service, 'down'),
    canMoveUp: (service) =>
      data.findIndex((s) => s.service_id === service.service_id) > 0,
    canMoveDown: (service) =>
      data.findIndex((s) => s.service_id === service.service_id) <
      data.length - 1,
    isReordering: reorderMutation.isPending,
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
      const service = row.original as Service
      const categoryName = categoryNameById.get(service.category_id)?.name ?? ''
      return (
        service.name.toLowerCase().includes(term) ||
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
