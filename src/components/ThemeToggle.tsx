import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

type ThemeMode = 'light' | 'dark' | 'auto'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }

  return 'auto'
}

function applyThemeMode(mode: ThemeMode): 'light' | 'dark' {
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved: 'light' | 'dark' =
    mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)

    if (mode === 'auto') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', mode)
    }

    document.documentElement.style.colorScheme = resolved
  }

  return resolved
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    const initialResolved = applyThemeMode(initialMode)
    setResolved(initialResolved)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') {
      return
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const newResolved = applyThemeMode('auto')
      setResolved(newResolved)
    }

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [mode])

  function toggleMode() {
    const nextMode: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    setMode(nextMode)
    const newResolved = applyThemeMode(nextMode)
    setResolved(newResolved)
    window.localStorage.setItem('theme', nextMode)
  }

  const label =
    mode === 'auto'
      ? `Theme: Auto (${resolved}) — Click to switch to light`
      : mode === 'dark'
        ? 'Theme: Dark — Click to switch to auto'
        : 'Theme: Light — Click to switch to dark'

  const isDark = resolved === 'dark'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          type="button"
          onClick={toggleMode}
          aria-label={label}
          title={label}
          className="relative inline-flex size-9 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-strong)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 motion-reduce:transform-none"
        >
          <span
            className="t-icon-swap relative inline-grid size-4.5 place-items-center"
            data-state={isDark ? 'dark' : 'light'}
          >
            <Sun
              data-icon="light"
              className={cn(
                'col-start-1 row-start-1 size-4.5 transition-all duration-250 ease-in-out motion-reduce:transition-none',
                isDark
                  ? 'pointer-events-none scale-25 -rotate-90 opacity-0 blur-[2px]'
                  : 'scale-100 rotate-0 opacity-100 blur-0 text-amber-500',
              )}
              aria-hidden="true"
            />
            <Moon
              data-icon="dark"
              className={cn(
                'col-start-1 row-start-1 size-4.5 transition-all duration-250 ease-in-out motion-reduce:transition-none',
                isDark
                  ? 'scale-100 rotate-0 opacity-100 blur-0 text-sky-400'
                  : 'pointer-events-none scale-25 rotate-90 opacity-0 blur-[2px]',
              )}
              aria-hidden="true"
            />
          </span>
        </TooltipTrigger>
        <TooltipPopup side="bottom" sideOffset={6}>
          {label}
        </TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  )
}
