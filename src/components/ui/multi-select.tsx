import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type MultiSelectOption = {
  label: string
  value: string
  icon?: string
}

type MultiSelectProps = {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

// A dropdown trigger that opens a searchable, checkbox-style list — for picking
// several values from a bounded vocabulary (e.g. cuisines) without the modal-dialog
// weight of a separate popup. Selected options render as removable badges on the
// trigger itself, same pattern as shadcn's common "multi-select combobox" recipe
// (Command + Popover + Checkbox), just not tied to any one feature's data shape.
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const optionByValue = React.useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options]
  )

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  function remove(value: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(selected.filter((v) => v !== value))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-auto min-h-9 w-full justify-between font-normal',
            className
          )}
        >
          {selected.length === 0 ? (
            <span className='text-muted-foreground'>{placeholder}</span>
          ) : (
            <div className='flex flex-1 flex-wrap gap-1'>
              {selected.map((value) => {
                const option = optionByValue.get(value)
                return (
                  <Badge key={value} variant='secondary' className='gap-1 pe-1'>
                    {option?.icon ? `${option.icon} ` : ''}
                    {option?.label ?? value}
                    <span
                      role='button'
                      tabIndex={-1}
                      className='rounded-full hover:bg-muted-foreground/20'
                      onClick={(e) => remove(value, e)}
                    >
                      <X className='size-3' />
                    </span>
                  </Badge>
                )
              })}
            </div>
          )}
          <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-(--radix-popover-trigger-width) p-0'
        align='start'
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className='size-3' />
                    </div>
                    {option.icon ? `${option.icon} ` : ''}
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
