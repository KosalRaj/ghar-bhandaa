import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { AnimatedNumber } from '#/components/ui/animated-number'
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  Drawer,
  DrawerBackdrop,
  DrawerBar,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerMenu,
  DrawerMenuItem,
  DrawerPanel,
  DrawerPopup,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
} from '#/components/ui/drawer'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '#/components/ui/input-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from '#/components/ui/menu'
import { Skeleton } from '#/components/ui/skeleton'
import {
  AnchoredToastProvider,
  ToastProvider,
  anchoredToastManager,
  toastManager,
} from '#/components/ui/toast'
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

describe('Design System Primitives & Components', () => {
  it('exports all Dialog and AlertDialog components with valid constructors', () => {
    expect(Dialog).toBeDefined()
    expect(DialogTrigger).toBeDefined()
    expect(DialogPopup).toBeDefined()
    expect(DialogBackdrop).toBeDefined()
    expect(DialogHeader).toBeDefined()
    expect(DialogFooter).toBeDefined()
    expect(DialogTitle).toBeDefined()
    expect(DialogDescription).toBeDefined()
    expect(DialogPanel).toBeDefined()
    expect(DialogClose).toBeDefined()

    expect(AlertDialog).toBeDefined()
    expect(AlertDialogTrigger).toBeDefined()
    expect(AlertDialogPopup).toBeDefined()
    expect(AlertDialogHeader).toBeDefined()
    expect(AlertDialogFooter).toBeDefined()
    expect(AlertDialogTitle).toBeDefined()
    expect(AlertDialogDescription).toBeDefined()
    expect(AlertDialogClose).toBeDefined()
  })

  it('exports all Menu and DropdownMenu components and aliases', () => {
    expect(Menu).toBeDefined()
    expect(MenuTrigger).toBeDefined()
    expect(MenuPopup).toBeDefined()
    expect(MenuGroup).toBeDefined()
    expect(MenuItem).toBeDefined()
    expect(MenuLinkItem).toBeDefined()
    expect(MenuCheckboxItem).toBeDefined()
    expect(MenuRadioGroup).toBeDefined()
    expect(MenuRadioItem).toBeDefined()
    expect(MenuGroupLabel).toBeDefined()
    expect(MenuSeparator).toBeDefined()
    expect(MenuShortcut).toBeDefined()
    expect(MenuSub).toBeDefined()
    expect(MenuSubTrigger).toBeDefined()
    expect(MenuSubPopup).toBeDefined()

    // Aliases
    expect(DropdownMenu).toBe(Menu)
    expect(DropdownMenuTrigger).toBe(MenuTrigger)
    expect(DropdownMenuContent).toBe(MenuPopup)
    expect(DropdownMenuItem).toBe(MenuItem)
  })

  it('exports all Drawer components and parts', () => {
    expect(Drawer).toBeDefined()
    expect(DrawerTrigger).toBeDefined()
    expect(DrawerPopup).toBeDefined()
    expect(DrawerHeader).toBeDefined()
    expect(DrawerFooter).toBeDefined()
    expect(DrawerTitle).toBeDefined()
    expect(DrawerDescription).toBeDefined()
    expect(DrawerPanel).toBeDefined()
    expect(DrawerBar).toBeDefined()
    expect(DrawerClose).toBeDefined()
    expect(DrawerSwipeArea).toBeDefined()
    expect(DrawerBackdrop).toBeDefined()
    expect(DrawerViewport).toBeDefined()
    expect(DrawerContent).toBeDefined()
    expect(DrawerMenu).toBeDefined()
    expect(DrawerMenuItem).toBeDefined()
  })

  it('exports Tooltip, Skeleton, InputGroup, and Empty primitives', () => {
    expect(Tooltip).toBeDefined()
    expect(TooltipTrigger).toBeDefined()
    expect(TooltipPopup).toBeDefined()
    expect(TooltipProvider).toBeDefined()

    expect(Skeleton).toBeDefined()

    expect(InputGroup).toBeDefined()
    expect(InputGroupAddon).toBeDefined()
    expect(InputGroupText).toBeDefined()
    expect(InputGroupInput).toBeDefined()
    expect(InputGroupTextarea).toBeDefined()

    expect(Empty).toBeDefined()
    expect(EmptyHeader).toBeDefined()
    expect(EmptyMedia).toBeDefined()
    expect(EmptyTitle).toBeDefined()
    expect(EmptyDescription).toBeDefined()
    expect(EmptyContent).toBeDefined()
  })

  it('exports both standard and anchored toast managers and providers', () => {
    expect(toastManager).toBeDefined()
    expect(typeof toastManager.add).toBe('function')
    expect(typeof toastManager.close).toBe('function')

    expect(anchoredToastManager).toBeDefined()
    expect(typeof anchoredToastManager.add).toBe('function')
    expect(typeof anchoredToastManager.close).toBe('function')

    expect(ToastProvider).toBeDefined()
    expect(AnchoredToastProvider).toBeDefined()

    // Adding and closing a toast with anchoredToastManager
    const id = anchoredToastManager.add({
      title: 'Copied!',
    })
    expect(typeof id).toBe('string')
    anchoredToastManager.close(id)
  })

  it('renders AnimatedNumber element structure with digit characters', () => {
    const element = AnimatedNumber({ value: '12,500' })
    expect(element).toBeDefined()
    const props = element.props as {
      'aria-label'?: string
      className?: string
      children?: unknown[]
    }
    expect(props['aria-label']).toBe('12,500')
    expect(props.className).toContain('t-digit-group')
    expect(props.children).toHaveLength(6)
  })
})

describe('Motion System Stylesheet Invariants (src/styles.css)', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf-8')

  it('contains the full 5-dimension :root motion tokens', () => {
    // Durations
    expect(css).toContain('--duration-stagger: 40ms')
    expect(css).toContain('--duration-micro: 80ms')
    expect(css).toContain('--duration-quick: 150ms')
    expect(css).toContain('--duration-fast: 250ms')
    expect(css).toContain('--duration-medium: 350ms')
    expect(css).toContain('--duration-slow: 400ms')
    expect(css).toContain('--duration-very-slow: 500ms')

    // Easings
    expect(css).toContain('--ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1)')
    expect(css).toContain('--ease-in-out: ease-in-out')
    expect(css).toContain('--ease-out: ease-out')
    expect(css).toContain('--ease-linear: linear')
    expect(css).toContain('--ease-bounce: cubic-bezier(0.34, 1.36, 0.64, 1)')
    expect(css).toContain(
      '--ease-bounce-strong: cubic-bezier(0.34, 3.85, 0.64, 1)',
    )

    // Distances
    expect(css).toContain('--distance-micro: 4px')
    expect(css).toContain('--distance-small: 6px')
    expect(css).toContain('--distance-base: 8px')
    expect(css).toContain('--distance-medium: 12px')
    expect(css).toContain('--distance-large: 30px')

    // Scales
    expect(css).toContain('--scale-large: 0.96')
    expect(css).toContain('--scale-medium: 0.97')
    expect(css).toContain('--scale-small: 0.98')
    expect(css).toContain('--scale-tiny: 0.99')

    // Blurs
    expect(css).toContain('--blur-small: 2px')
    expect(css).toContain('--blur-medium: 3px')
    expect(css).toContain('--blur-large: 8px')
  })

  it('defines asymmetric dialog and dropdown timing', () => {
    expect(css).toContain('--modal-open-dur: var(--duration-fast)')
    expect(css).toContain('--modal-close-dur: var(--duration-quick)')
    expect(css).toContain('--dropdown-open-dur: var(--duration-fast)')
    expect(css).toContain('--dropdown-close-dur: var(--duration-quick)')

    expect(css).toContain('[data-slot="dialog-backdrop"]')
    expect(css).toContain('[data-slot="dialog-popup"]')
    expect(css).toContain('[data-slot="alert-dialog-backdrop"]')
    expect(css).toContain('[data-slot="alert-dialog-popup"]')
    expect(css).toContain('[data-slot="menu-popup"]')
  })

  it('defines micro-interactions: number pop-in, error shake, success check, staggers', () => {
    expect(css).toContain('@keyframes t-digit-pop-in')
    expect(css).toContain('.t-digit-group')
    expect(css).toContain('.t-digit')

    expect(css).toContain('@keyframes t-input-shake')
    expect(css).toContain('.t-input-shake')
    expect(css).toContain('.t-input.is-shaking')

    expect(css).toContain('@keyframes t-success-draw')
    expect(css).toContain('.t-success-check')

    expect(css).toContain('.stagger-1')
    expect(css).toContain('.stagger-6')
  })

  it('contains the universal prefers-reduced-motion guard', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('animation-duration: 0.01ms !important')
    expect(css).toContain('transition-duration: 0.01ms !important')
  })
})
