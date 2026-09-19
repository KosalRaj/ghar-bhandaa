import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import { Popover, PopoverPopup, PopoverTrigger } from '#/components/ui/popover'
import { cn } from '#/lib/utils'

export interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  required?: boolean
}

/**
 * Formats a Date object into a YYYY-MM-DD string using local calendar parts.
 */
function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
function parseDateString(str?: string): Date | undefined {
  if (!str) return undefined
  const parts = str.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return undefined
  const [year, month, day] = parts
  const date = new Date(year, month - 1, day)
  return isNaN(date.getTime()) ? undefined : date
}

/**
 * Formats date for human-readable display on the button trigger.
 */
function formatDisplayDate(date?: Date): string {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  id,
  name,
}: DatePickerProps): React.ReactElement {
  const [open, setOpen] = React.useState(false)
  const selectedDate = React.useMemo(() => parseDateString(value), [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const str = toDateString(date)
      onChange?.(str)
    } else {
      onChange?.('')
    }
    setOpen(false)
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              id={id}
              name={name}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal text-sm h-9 px-3',
                !value && 'text-muted-foreground',
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 size-4 opacity-70" aria-hidden="true" />
          <span>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverPopup align="start" className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate || new Date()}
            onSelect={handleSelect}
          />
        </PopoverPopup>
      </Popover>
    </div>
  )
}
