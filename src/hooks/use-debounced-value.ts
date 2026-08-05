import { useEffect, useState } from 'react'

/**
 * Returns `value`, but only updates after `delay` ms of no further changes.
 * Used to avoid firing a network request on every keystroke of a search box.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debounced
}
