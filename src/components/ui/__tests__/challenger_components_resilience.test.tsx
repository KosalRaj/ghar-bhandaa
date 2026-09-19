// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// Dialog and AlertDialog
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogCreateHandle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogPrimitive,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogViewport,
} from '#/components/ui/alert-dialog'
import { AnimatedNumber } from '#/components/ui/animated-number'
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogCreateHandle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPanel,
  DialogPopup,
  DialogPortal,
  DialogPrimitive,
  DialogTitle,
  DialogTrigger,
  DialogViewport,
} from '#/components/ui/dialog'
// Drawer
import {
  Drawer,
  DrawerBackdrop,
  DrawerBar,
  DrawerClose,
  DrawerContent,
  DrawerCreateHandle,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerMenu,
  DrawerMenuCheckboxItem,
  DrawerMenuGroup,
  DrawerMenuGroupLabel,
  DrawerMenuItem,
  DrawerMenuRadioGroup,
  DrawerMenuRadioItem,
  DrawerMenuSeparator,
  DrawerMenuTrigger,
  DrawerPanel,
  DrawerPopup,
  DrawerPortal,
  DrawerPrimitive,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
} from '#/components/ui/drawer'
// Empty
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
// InputGroup
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '#/components/ui/input-group'
// Menu
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuCreateHandle,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Menu,
  MenuCheckboxItem,
  MenuCreateHandle,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuPortal,
  MenuPrimitive,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from '#/components/ui/menu'
// Skeleton
import { Skeleton } from '#/components/ui/skeleton'
// Toast
import {
  AnchoredToastProvider,
  ToastPrimitive,
  ToastProvider,
  anchoredToastManager,
  toastManager,
} from '#/components/ui/toast'
// Tooltip
import {
  Tooltip,
  TooltipContent,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipPrimitive,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

describe('Challenger M1.2: UI Primitives Resilience & Contract Verification', () => {
  describe('Export Signatures & Constructor Completeness', () => {
    it('verifies all AlertDialog primitives and alias exports', () => {
      expect(AlertDialog).toBeDefined()
      expect(AlertDialogTrigger).toBeDefined()
      expect(AlertDialogPortal).toBeDefined()
      expect(AlertDialogBackdrop).toBeDefined()
      expect(AlertDialogViewport).toBeDefined()
      expect(AlertDialogPopup).toBeDefined()
      expect(AlertDialogHeader).toBeDefined()
      expect(AlertDialogFooter).toBeDefined()
      expect(AlertDialogTitle).toBeDefined()
      expect(AlertDialogDescription).toBeDefined()
      expect(AlertDialogClose).toBeDefined()
      expect(AlertDialogOverlay).toBe(AlertDialogBackdrop)
      expect(AlertDialogContent).toBe(AlertDialogPopup)
      expect(AlertDialogCreateHandle).toBe(AlertDialogPrimitive.createHandle)
    })

    it('verifies all Dialog primitives and alias exports', () => {
      expect(Dialog).toBeDefined()
      expect(DialogTrigger).toBeDefined()
      expect(DialogPortal).toBeDefined()
      expect(DialogBackdrop).toBeDefined()
      expect(DialogViewport).toBeDefined()
      expect(DialogPopup).toBeDefined()
      expect(DialogHeader).toBeDefined()
      expect(DialogFooter).toBeDefined()
      expect(DialogTitle).toBeDefined()
      expect(DialogDescription).toBeDefined()
      expect(DialogPanel).toBeDefined()
      expect(DialogClose).toBeDefined()
      expect(DialogOverlay).toBe(DialogBackdrop)
      expect(DialogContent).toBe(DialogPopup)
      expect(DialogCreateHandle).toBe(DialogPrimitive.createHandle)
    })

    it('verifies all Menu primitives and DropdownMenu aliases', () => {
      expect(Menu).toBeDefined()
      expect(MenuTrigger).toBeDefined()
      expect(MenuPortal).toBeDefined()
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
      expect(MenuCreateHandle).toBe(MenuPrimitive.createHandle)

      expect(DropdownMenu).toBe(Menu)
      expect(DropdownMenuTrigger).toBe(MenuTrigger)
      expect(DropdownMenuPortal).toBe(MenuPortal)
      expect(DropdownMenuContent).toBe(MenuPopup)
      expect(DropdownMenuGroup).toBe(MenuGroup)
      expect(DropdownMenuItem).toBe(MenuItem)
      expect(DropdownMenuCheckboxItem).toBe(MenuCheckboxItem)
      expect(DropdownMenuRadioGroup).toBe(MenuRadioGroup)
      expect(DropdownMenuRadioItem).toBe(MenuRadioItem)
      expect(DropdownMenuLabel).toBe(MenuGroupLabel)
      expect(DropdownMenuSeparator).toBe(MenuSeparator)
      expect(DropdownMenuShortcut).toBe(MenuShortcut)
      expect(DropdownMenuSub).toBe(MenuSub)
      expect(DropdownMenuSubTrigger).toBe(MenuSubTrigger)
      expect(DropdownMenuSubContent).toBe(MenuSubPopup)
      expect(DropdownMenuCreateHandle).toBe(MenuCreateHandle)
    })

    it('verifies all Drawer components and parts', () => {
      expect(Drawer).toBeDefined()
      expect(DrawerTrigger).toBeDefined()
      expect(DrawerPortal).toBeDefined()
      expect(DrawerBackdrop).toBeDefined()
      expect(DrawerViewport).toBeDefined()
      expect(DrawerPopup).toBeDefined()
      expect(DrawerHeader).toBeDefined()
      expect(DrawerFooter).toBeDefined()
      expect(DrawerTitle).toBeDefined()
      expect(DrawerDescription).toBeDefined()
      expect(DrawerPanel).toBeDefined()
      expect(DrawerBar).toBeDefined()
      expect(DrawerClose).toBeDefined()
      expect(DrawerSwipeArea).toBeDefined()
      expect(DrawerContent).toBe(DrawerPrimitive.Content)
      expect(DrawerMenu).toBeDefined()
      expect(DrawerMenuItem).toBeDefined()
      expect(DrawerMenuSeparator).toBeDefined()
      expect(DrawerMenuGroup).toBeDefined()
      expect(DrawerMenuGroupLabel).toBeDefined()
      expect(DrawerMenuTrigger).toBeDefined()
      expect(DrawerMenuCheckboxItem).toBeDefined()
      expect(DrawerMenuRadioGroup).toBeDefined()
      expect(DrawerMenuRadioItem).toBeDefined()
      expect(DrawerCreateHandle).toBe(DrawerPrimitive.createHandle)
    })

    it('verifies Tooltip, Skeleton, InputGroup, Empty, and Toast primitives', () => {
      expect(Tooltip).toBeDefined()
      expect(TooltipTrigger).toBeDefined()
      expect(TooltipPopup).toBeDefined()
      expect(TooltipProvider).toBeDefined()
      expect(TooltipContent).toBe(TooltipPopup)
      expect(TooltipCreateHandle).toBe(TooltipPrimitive.createHandle)

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

      expect(ToastProvider).toBeDefined()
      expect(AnchoredToastProvider).toBeDefined()
      expect(toastManager).toBeDefined()
      expect(anchoredToastManager).toBeDefined()
      expect(ToastPrimitive).toBeDefined()
    })
  })

  describe('SSR (Server-Side Rendering) Resilience with react-dom/server', () => {
    it('safely renders Skeleton on server with custom classNames', () => {
      const html = renderToString(
        <Skeleton className="h-6 w-32" data-testid="skel" />,
      )
      expect(html).toContain('animate-skeleton')
      expect(html).toContain('h-6 w-32')
      expect(html).toContain('data-slot="skeleton"')
    })

    it('safely renders Empty compound components on server', () => {
      const html = renderToString(
        <Empty className="custom-empty">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <span id="test-icon">Icon</span>
            </EmptyMedia>
            <EmptyTitle>No Invoices Found</EmptyTitle>
            <EmptyDescription>
              Create your first invoice to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button type="button">Create Invoice</button>
          </EmptyContent>
        </Empty>,
      )
      expect(html).toContain('data-slot="empty"')
      expect(html).toContain('data-slot="empty-header"')
      expect(html).toContain('data-slot="empty-media"')
      expect(html).toContain('data-slot="empty-title"')
      expect(html).toContain('data-slot="empty-description"')
      expect(html).toContain('data-slot="empty-content"')
      expect(html).toContain('No Invoices Found')
      expect(html).toContain('Create Invoice')
    })

    it('safely renders InputGroup with addons and text on server', () => {
      const html = renderToString(
        <InputGroup className="my-input-group">
          <InputGroupAddon align="inline-start">
            <InputGroupText>NPR</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Amount" />
          <InputGroupAddon align="inline-end">
            <button type="button">Submit</button>
          </InputGroupAddon>
        </InputGroup>,
      )
      expect(html).toContain('data-slot="input-group"')
      expect(html).toContain('data-slot="input-group-addon"')
      expect(html).toContain('data-align="inline-start"')
      expect(html).toContain('data-align="inline-end"')
      expect(html).toContain('NPR')
      expect(html).toContain('Submit')
    })

    it('safely renders Dialog and AlertDialog compositions on server without throwing', () => {
      const dialogHtml = renderToString(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogPopup portalProps={{ keepMounted: true }}>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <DialogPanel>Dialog Content</DialogPanel>
            <DialogFooter variant="bare">
              <button type="button">Cancel</button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>,
      )
      expect(dialogHtml).toContain('data-slot="dialog-trigger"')
      expect(dialogHtml).toContain('Open Dialog')

      const alertHtml = renderToString(
        <AlertDialog>
          <AlertDialogTrigger>Open Alert</AlertDialogTrigger>
          <AlertDialogPopup portalProps={{ keepMounted: true }}>
            <AlertDialogHeader>
              <AlertDialogTitle>Alert Title</AlertDialogTitle>
              <AlertDialogDescription>Alert Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter variant="default">
              <button type="button">Cancel</button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>,
      )
      expect(alertHtml).toContain('data-slot="alert-dialog-trigger"')
      expect(alertHtml).toContain('Open Alert')
    })

    it('renders Dialog and AlertDialog into the DOM tree when opened', () => {
      const { getByRole, getByText } = render(
        <Dialog defaultOpen>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <DialogPanel>Dialog Content</DialogPanel>
            <DialogFooter variant="bare">
              <button type="button">Cancel</button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>,
      )

      expect(getByRole('dialog')).toBeDefined()
      expect(getByText('Dialog Title')).toBeDefined()
      expect(getByText('Dialog Description')).toBeDefined()
      expect(getByText('Dialog Content')).toBeDefined()
    })

    it('safely renders Drawer menu items and structure on server', () => {
      const drawerHtml = renderToString(
        <DrawerMenu>
          <DrawerMenuGroup>
            <DrawerMenuGroupLabel>Navigation</DrawerMenuGroupLabel>
            <DrawerMenuItem>Properties</DrawerMenuItem>
            <DrawerMenuItem variant="destructive">Delete All</DrawerMenuItem>
            <DrawerMenuSeparator />
          </DrawerMenuGroup>
        </DrawerMenu>,
      )
      expect(drawerHtml).toContain('data-slot="drawer-menu"')
      expect(drawerHtml).toContain('data-slot="drawer-menu-group"')
      expect(drawerHtml).toContain('data-slot="drawer-menu-group-label"')
      expect(drawerHtml).toContain('data-slot="drawer-menu-item"')
      expect(drawerHtml).toContain('data-slot="drawer-menu-separator"')
      expect(drawerHtml).toContain('Properties')
      expect(drawerHtml).toContain('data-variant="destructive"')
    })
  })

  describe('AnimatedNumber Boundary Stress Tests', () => {
    it('handles empty string without crashing', () => {
      const { container } = render(<AnimatedNumber value="" />)
      const group = container.querySelector('.t-digit-group')
      expect(group).not.toBeNull()
      expect(group?.getAttribute('aria-label')).toBe('')
      expect(group?.querySelectorAll('.t-digit')).toHaveLength(0)
    })

    it('handles single digit correctly with stagger 2', () => {
      const { container } = render(<AnimatedNumber value="7" />)
      const digits = container.querySelectorAll('.t-digit')
      expect(digits).toHaveLength(1)
      expect(digits[0].textContent).toBe('7')
      expect(digits[0].getAttribute('data-stagger')).toBe('2')
    })

    it('handles two digits correctly with stagger 1 and 2', () => {
      const { container } = render(<AnimatedNumber value={42} />)
      const digits = container.querySelectorAll('.t-digit')
      expect(digits).toHaveLength(2)
      expect(digits[0].textContent).toBe('4')
      expect(digits[0].getAttribute('data-stagger')).toBe('1')
      expect(digits[1].textContent).toBe('2')
      expect(digits[1].getAttribute('data-stagger')).toBe('2')
    })

    it('handles large formatted currency values with commas, decimal points, and prefix', () => {
      const testVal = 'NPR 1,234,567.89'
      const { container } = render(<AnimatedNumber value={testVal} />)
      const group = container.querySelector('.t-digit-group')
      expect(group?.getAttribute('aria-label')).toBe(testVal)

      const digits = container.querySelectorAll('.t-digit')
      expect(digits).toHaveLength(testVal.length)

      // Only the last two characters get stagger 1 and 2
      expect(digits[testVal.length - 2].getAttribute('data-stagger')).toBe('1')
      expect(digits[testVal.length - 1].getAttribute('data-stagger')).toBe('2')

      // Previous characters should not have data-stagger
      expect(digits[0].getAttribute('data-stagger')).toBeNull()
      expect(digits[testVal.length - 3].getAttribute('data-stagger')).toBeNull()
    })

    it('handles negative numbers', () => {
      const { container } = render(<AnimatedNumber value={-9500} />)
      const group = container.querySelector('.t-digit-group')
      expect(group?.getAttribute('aria-label')).toBe('-9500')
      const digits = container.querySelectorAll('.t-digit')
      expect(digits[0].textContent).toBe('-')
    })

    it('stress tests rapid numeric value updates', () => {
      const { container, rerender } = render(<AnimatedNumber value={100} />)
      for (let i = 101; i <= 200; i++) {
        rerender(<AnimatedNumber value={i} />)
        const group = container.querySelector('.t-digit-group')
        expect(group?.getAttribute('aria-label')).toBe(String(i))
      }
    })
  })

  describe('InputGroup Addon & Focus Management Stress Tests', () => {
    it('focuses the child input when non-interactive addon is clicked', () => {
      const { getByTestId } = render(
        <InputGroup>
          <InputGroupAddon data-testid="addon-left" align="inline-start">
            <span data-testid="addon-label">Rs.</span>
          </InputGroupAddon>
          <InputGroupInput data-testid="main-input" />
        </InputGroup>,
      )

      const input = getByTestId('main-input') as HTMLInputElement
      const addonLabel = getByTestId('addon-label')

      expect(document.activeElement).not.toBe(input)
      fireEvent.mouseDown(addonLabel)
      expect(document.activeElement).toBe(input)
    })

    it('does not steal focus when interactive element inside addon is clicked', () => {
      const handleBtnClick = vi.fn()
      const { getByTestId } = render(
        <InputGroup>
          <InputGroupInput data-testid="main-input-2" />
          <InputGroupAddon align="inline-end">
            <button
              data-testid="interactive-btn"
              type="button"
              onClick={handleBtnClick}
            >
              Copy
            </button>
          </InputGroupAddon>
        </InputGroup>,
      )

      const btn = getByTestId('interactive-btn')
      const input = getByTestId('main-input-2')

      fireEvent.mouseDown(btn)
      fireEvent.click(btn)
      expect(handleBtnClick).toHaveBeenCalledTimes(1)
      expect(document.activeElement).not.toBe(input)
    })
  })

  describe('Drawer Configuration & Position Variations', () => {
    it('renders Drawer with all 4 positions (bottom, top, left, right) using coss canonical structure', () => {
      const positions = ['bottom', 'top', 'left', 'right'] as const
      for (const pos of positions) {
        const { unmount } = render(
          <Drawer position={pos} defaultOpen>
            <DrawerTrigger>Open {pos}</DrawerTrigger>
            <DrawerPopup position={pos} showBar>
              <DrawerHeader>
                <DrawerTitle>{pos} Drawer</DrawerTitle>
              </DrawerHeader>
              <DrawerPanel>Panel Content</DrawerPanel>
              <DrawerFooter>
                <DrawerClose>Close</DrawerClose>
              </DrawerFooter>
            </DrawerPopup>
          </Drawer>,
        )
        unmount()
      }
    })

    it('renders DrawerMenuCheckboxItem with switch and default variants', () => {
      const { unmount: unmount1 } = render(
        <DrawerMenuCheckboxItem
          data-testid="chk-default"
          checked={true}
          variant="default"
        >
          Check Option
        </DrawerMenuCheckboxItem>,
      )
      unmount1()

      const { unmount: unmount2 } = render(
        <DrawerMenuCheckboxItem
          data-testid="chk-switch"
          checked={false}
          variant="switch"
        >
          Switch Option
        </DrawerMenuCheckboxItem>,
      )
      unmount2()
    })
  })

  describe('Toast Manager High-Load & Invariant Stress Tests', () => {
    it('handles rapid sequential toast creation and disposal', () => {
      const toastIds: string[] = []
      for (let i = 0; i < 50; i++) {
        const id = toastManager.add({
          title: `Invoice #${i}`,
          description: `Status updated to paid at NPR ${i * 100}`,
          type: (['success', 'error', 'info', 'warning', 'loading'] as const)[
            i % 5
          ],
        })
        expect(typeof id).toBe('string')
        toastIds.push(id)
      }

      // Bulk close
      for (const id of toastIds) {
        toastManager.close(id)
      }

      // Closing nonexistent ID must not throw
      expect(() => toastManager.close('nonexistent-id-123')).not.toThrow()
    })

    it('handles anchoredToastManager with tooltips and custom keys', () => {
      const id1 = anchoredToastManager.add({
        title: 'Copied to clipboard',
        data: { tooltipStyle: true },
      })
      expect(typeof id1).toBe('string')
      anchoredToastManager.close(id1)

      const id2 = anchoredToastManager.add({
        title: 'Payment Recorded',
        description: 'Paisa 50,000 credited to lease',
        type: 'success',
        data: { tooltipStyle: false },
      })
      expect(typeof id2).toBe('string')
      anchoredToastManager.close(id2)
    })
  })

  describe('Motion System Invariant Audit (src/styles.css)', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf-8')

    it('ensures all 5 token dimensions (duration, easing, distance, scale, blur) are defined', () => {
      // 1. Durations
      expect(css).toMatch(/--duration-stagger:\s*40ms/)
      expect(css).toMatch(/--duration-micro:\s*80ms/)
      expect(css).toMatch(/--duration-quick:\s*150ms/)
      expect(css).toMatch(/--duration-fast:\s*250ms/)
      expect(css).toMatch(/--duration-medium:\s*350ms/)
      expect(css).toMatch(/--duration-slow:\s*400ms/)
      expect(css).toMatch(/--duration-very-slow:\s*500ms/)

      // 2. Easings
      expect(css).toMatch(
        /--ease-smooth-out:\s*cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/,
      )
      expect(css).toMatch(
        /--ease-bounce:\s*cubic-bezier\(0\.34,\s*1\.36,\s*0\.64,\s*1\)/,
      )
      expect(css).toMatch(
        /--ease-bounce-strong:\s*cubic-bezier\(0\.34,\s*3\.85,\s*0\.64,\s*1\)/,
      )

      // 3. Distances
      expect(css).toMatch(/--distance-micro:\s*4px/)
      expect(css).toMatch(/--distance-small:\s*6px/)
      expect(css).toMatch(/--distance-base:\s*8px/)
      expect(css).toMatch(/--distance-medium:\s*12px/)
      expect(css).toMatch(/--distance-large:\s*30px/)

      // 4. Scales
      expect(css).toMatch(/--scale-large:\s*0\.96/)
      expect(css).toMatch(/--scale-medium:\s*0\.97/)
      expect(css).toMatch(/--scale-small:\s*0\.98/)
      expect(css).toMatch(/--scale-tiny:\s*0\.99/)

      // 5. Blurs
      expect(css).toMatch(/--blur-small:\s*2px/)
      expect(css).toMatch(/--blur-medium:\s*3px/)
      expect(css).toMatch(/--blur-large:\s*8px/)
    })

    it('enforces open/close asymmetric duration tokens', () => {
      expect(css).toMatch(/--modal-open-dur:\s*var\(--duration-fast\)/)
      expect(css).toMatch(/--modal-close-dur:\s*var\(--duration-quick\)/)
      expect(css).toMatch(/--dropdown-open-dur:\s*var\(--duration-fast\)/)
      expect(css).toMatch(/--dropdown-close-dur:\s*var\(--duration-quick\)/)
    })

    it('verifies media query prefers-reduced-motion neutralizes motion', () => {
      expect(css).toContain('@media (prefers-reduced-motion: reduce)')
      expect(css).toContain('animation-duration: 0.01ms !important')
      expect(css).toContain('transition-duration: 0.01ms !important')
    })
  })
})
