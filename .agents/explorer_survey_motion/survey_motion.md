# Motion & Animation System Survey — Ghar-Bhandaa

## 1. Executive Summary & Motion Vision

This survey establishes the complete motion and animation architecture for **Ghar-Bhandaa**, modernizing the rental property management application with the **transitions.dev** motion system and the **transitions-polish** token doctrine.

### Core Objectives
1. **Systematic Tokenization**: Replace arbitrary, scattered transition durations (`180ms`, `170ms`, `700ms`, `0.32s`) with an authoritative, unified `:root` motion-token scale spanning the 5 core dimensions: **Duration**, **Easing**, **Distance**, **Scale**, and **Blur**.
2. **Strict Open/Close Asymmetry**: Opening is an invitation; closing gets out of the way. Modals and dropdowns enter smoothly (`250ms`, `--duration-fast`) with `cubic-bezier(0.22, 1, 0.36, 1)` and dismiss briskly (`150ms`, `--duration-quick`).
3. **Bounded Stagger Architecture (< 300ms Total)**: Enforce a strict mathematical ceiling on all sequential entrances (dashboard stat cards, property grids, table rows) using a `40ms` item offset capped at ≤ 6 items (`240ms` total), ensuring no interface element arrives noticeably late.
4. **Purposeful Micro-Interactions**: Bring tactile life to key user moments:
   - **Number Pop-in** (`t-digit-group`) on financial statistics and invoice balance figures.
   - **Error State Shake** (`t-input-shake`) on invalid form submissions with auto-reverting feedback.
   - **Success Check** (`t-success-check`) for payment confirmations and invoice issuance.
   - **Tactile Hover & Tap** dynamics on cards, buttons, and avatars.
5. **Zero-Regression Accessibility**: Provide unconditional `@media (prefers-reduced-motion: reduce)` guards across all keyframes and transitions, neutralizing movement for motion-sensitive users.

---

## 2. Comprehensive Audit of Existing Motion Landscape

A thorough inspection of `src/styles.css`, component primitives in `src/components/ui/`, and application routes reveals several gaps, inconsistencies, and uncalibrated animations:

### 2.1 Stylesheet Audit (`src/styles.css`)
- **Arbitrary Global Transitions**:
  - `src/styles.css:388-396`:
    ```css
    button, .island-shell, a {
      transition: background-color 180ms ease, color 180ms ease,
                  border-color 180ms ease, transform 180ms ease;
    }
    ```
    *Issue*: `180ms ease` is an off-grid duration with a generic CSS `ease` curve that feels sluggish on exit and lacks the snappy spring of `--ease-smooth-out`.
  - `src/styles.css:422`: `transition: transform 170ms ease;` on `.nav-link::after`.
    *Issue*: Arbitrary `170ms`, uncalibrated to the motion token scale.
  - `src/styles.css:435-448`: `.rise-in` animation:
    ```css
    .rise-in {
      animation: rise-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    ```
    *Issue*: `700ms` is excessively slow for standard UI entrances, reads as sluggish, and completely lacks a `prefers-reduced-motion` override.
  - `src/styles.css:177-184` & `toast.tsx:55-57`:
    ```css
    --animate-toast-success-odd: toast-success-odd 0.32s cubic-bezier(0.5, 1, 0.89, 1);
    --animate-toast-error-odd: toast-error-odd 0.28s cubic-bezier(0.5, 1, 0.89, 1);
    ```
    *Issue*: Custom toast replay shakes use non-standard easing curves (`cubic-bezier(0.5, 1, 0.89, 1)`) and arbitrary durations (`0.32s`, `0.28s`) instead of tokenized `--duration-medium` (350ms) or `--duration-quick` (150ms).
  - **Absence of Motion Tokens**: No CSS custom properties exist for durations, easings, distances, scales, or blurs.
  - **Absence of Reduced Motion Media Queries**: Not a single `@media (prefers-reduced-motion: reduce)` block is currently defined in `src/styles.css`.

### 2.2 Component Primitives Audit (`src/components/ui/`)
- **`dialog.tsx:37 & 87` (Modals)**:
  - Backdrop: `transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0`
  - Popup: `transition-[scale,opacity,translate] duration-200 ease-in-out ... sm:data-ending-style:scale-98 sm:data-starting-style:scale-98`
  *Issue*: Modal open and close are symmetric (`200ms ease-in-out`). Violates the core asymmetry doctrine where open should be `250ms` (`--duration-fast`) with pre-scale `0.96` (`--scale-large`) and close should be `150ms` (`--duration-quick`).
- **`popover.tsx:52, 59` & `select.tsx:139` (Dropdowns & Popovers)**:
  - `transition-[width,height,scale,opacity] ... data-starting-style:scale-98 data-starting-style:opacity-0`
  *Issue*: No exit speedup (`150ms`), no origin-aware growing pre-scale (`0.97`) to closing scale (`0.99`), and generic easing instead of `--ease-smooth-out`.
- **`tabs.tsx:61` (Tabs Indicator)**:
  - `transition-[width,translate] duration-200 ease-in-out`
  *Issue*: Should use `--duration-fast` (250ms) and `--ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1)`.
- **`switch.tsx:12, 20`**:
  - `[transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]`
  *Issue*: Hardcoded inline classes rather than semantic tokens.
- **`toast.tsx:94`**:
  - `[transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s,background-color_.5s]`
  *Issue*: Hardcoded literal timing rather than token variables.

### 2.3 Routes & Screens Audit
- **`_authed/dashboard.tsx`**:
  - 4 Key Statistics cards (Total Collected, Total Outstanding, Active Leases, Overdue Invoices): Render static text numbers with no entrance sequence or number update pop-in.
  - Invoices Table & Create Invoice Dialog: No form invalidation shake feedback.
- **`_authed/invoices.$invoiceId.tsx`**:
  - Cash Payment Recording Modal: No error state shake when payment exceeds remaining balance or is 0; no celebration/success-check animation upon recording payment.
- **`_authed/properties.tsx`, `rooms.tsx`, `tenants.tsx`, `leases.tsx`**:
  - Entity cards render simultaneously in grids (`sm:grid-cols-2 lg:grid-cols-3`) with no subtle entrance stagger.
  - Hover states on cards use ad-hoc `hover:shadow-md transition-shadow` without calibrated transform lift and border-color transitions.
- **`login.tsx` & `signup.tsx`**:
  - Form validation errors show plain alerts without the percussive, tactile error state shake.

---

## 3. Core Motion Token Scale (`:root` Architecture)

The motion system is founded on the five canonical dimensions defined in `transitions-polish` and `transitions-dev`. All animation snippets, component transitions, and micro-interactions reference these exact tokens.

### 3.1 The 5 Dimensions Token Matrix

| Dimension | Token Name | Token Value | Primary Application |
| :--- | :--- | :--- | :--- |
| **Duration** | `--duration-stagger` | `40ms` | Per-item sequential entrance stagger |
| | `--duration-micro` | `80ms` | Tooltip delay, shake leg segment, active tap compression |
| | `--duration-quick` | `150ms` | Modal/dropdown close, hover in/out, text swap, tooltip open |
| | `--duration-fast` | `250ms` | Modal/dropdown open, tabs slide, page slide, icon swap |
| | `--duration-medium` | `350ms` | Panel close, toast close/dismiss |
| | `--duration-slow` | `400ms` | Panel/drawer open, skeleton content reveal |
| | `--duration-very-slow`| `500ms` | Number pop-in, celebratory badge appear, success check |
| **Easing** | `--ease-smooth-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default surface curve: open/close, slides, lifts, dialogs |
| | `--ease-in-out` | `ease-in-out` | Symmetric reversible: icon swap, text swap |
| | `--ease-out` | `ease-out` | Tooltips, linear deceleration |
| | `--ease-linear` | `linear` | Shimmer effects, progress bars, spinners |
| | `--ease-bounce` | `cubic-bezier(0.34, 1.36, 0.64, 1)` | Badge pop open, entrance overshoot |
| | `--ease-bounce-strong`| `cubic-bezier(0.34, 3.85, 0.64, 1)`| Avatar stack hover-out settle, bouncy spring return |
| **Distance** | `--distance-micro` | `4px` | In-place text swap travel |
| | `--distance-small` | `6px` | Error shake minor leg |
| | `--distance-base` | `8px` | Page slide, number pop-in travel, error shake major leg |
| | `--distance-medium` | `12px` | Rise-in entrance, dialog mobile bottom-stick offset |
| | `--distance-large` | `30px` | Checkmark badge sweep, celebratory pop |
| **Scale** | `--scale-large` | `0.96` | Modal dialog entrance & exit pre-scale |
| | `--scale-medium` | `0.97` | Menu dropdown & popover entrance pre-scale |
| | `--scale-small` | `0.98` | Active button tap compression, tooltip open |
| | `--scale-tiny` | `0.99` | Menu dropdown closing scale |
| **Blur** | `--blur-small` | `2px` | Number pop-in, text swap, badge reveal |
| | `--blur-medium` | `3px` | Page slide, surface cross-fade |
| | `--blur-large` | `8px` | Success check opening burst |

### 3.2 Component Semantic Alias Mappings
To maintain 100% drop-in portability with the `transitions-dev` library:
- **Card resize**: `--resize-dur: 300ms; --resize-ease: var(--ease-smooth-out);`
- **Number pop-in**: `--digit-dur: var(--duration-very-slow); --digit-distance: var(--distance-base); --digit-stagger: 70ms; --digit-blur: var(--blur-small); --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1); --digit-dir-x: 0; --digit-dir-y: 1;`
- **Notification badge**: `--badge-slide-dur: 260ms; --badge-pop-dur: var(--duration-very-slow); --badge-pop-close-dur: 180ms; --badge-fade-dur: var(--duration-slow); --badge-fade-close-dur: 180ms; --badge-blur: var(--blur-small); --badge-offset-x: -8.2px; --badge-offset-y: 12.4px; --badge-slide-ease: var(--ease-smooth-out); --badge-pop-ease: var(--ease-bounce); --badge-close-ease: cubic-bezier(0.4, 0, 0.2, 1);`
- **Text states swap**: `--text-swap-dur: 200ms; --text-swap-translate-y: var(--distance-base); --text-swap-blur: var(--blur-small); --text-swap-ease: var(--ease-out);`
- **Menu dropdown**: `--dropdown-open-dur: var(--duration-fast); --dropdown-close-dur: var(--duration-quick); --dropdown-pre-scale: var(--scale-medium); --dropdown-closing-scale: var(--scale-tiny); --dropdown-ease: var(--ease-smooth-out);`
- **Modal open / close**: `--modal-open-dur: var(--duration-fast); --modal-close-dur: var(--duration-quick); --modal-scale: var(--scale-large); --modal-scale-close: var(--scale-large); --modal-ease: var(--ease-smooth-out);`
- **Panel reveal**: `--panel-open-dur: var(--duration-slow); --panel-close-dur: var(--duration-medium); --panel-translate-y: 100px; --panel-blur: var(--blur-small); --panel-ease: var(--ease-smooth-out);`
- **Page side-by-side**: `--page-slide-dur: 200ms; --page-fade-dur: 200ms; --page-slide-distance: var(--distance-base); --page-blur: var(--blur-medium); --page-stagger: 0ms; --page-exit-enabled: 1; --page-slide-ease: var(--ease-smooth-out); --page-fade-ease: var(--ease-smooth-out);`
- **Icon swap**: `--icon-swap-dur: 200ms; --icon-swap-blur: var(--blur-small); --icon-swap-start-scale: 0.25; --icon-swap-ease: var(--ease-in-out);`
- **Success check**: `--check-opacity-dur: 550ms; --check-rotate-dur: 550ms; --check-rotate-from: 80deg; --check-bob-dur: 450ms; --check-y-amount: 40px; --check-blur-dur: var(--duration-very-slow); --check-blur-from: 10px; --check-path-dur: 550ms; --check-path-delay: var(--duration-micro); --check-ease-out: var(--ease-smooth-out); --check-ease-opacity: var(--ease-smooth-out); --check-ease-rotate: var(--ease-smooth-out); --check-ease-bob: cubic-bezier(0.34, 1.35, 0.64, 1); --check-ease-path: var(--ease-smooth-out);`
- **Avatar group hover**: `--avatar-lift: -4px; --avatar-dur: 320ms; --avatar-scale: 1.05; --avatar-falloff: 0.45; --avatar-ease-in: var(--ease-smooth-out); --avatar-ease-out: var(--ease-bounce-strong);`
- **Error state shake**: `--shake-distance: var(--distance-small); --shake-overshoot: var(--distance-micro); --shake-dur-a: var(--duration-micro); --shake-dur-b: 60ms; --shake-ease: var(--ease-smooth-out); --revert-hold: 3000ms; --revert-dur: 280ms;`

---

## 4. Asymmetric Surface Motion Architecture

The fundamental rule of transitions-polish is **open/close asymmetry**: entrances should be smooth, welcoming invitations, while exits should quickly and unobtrusively get out of the user's way.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SURFACE MOTION TIMELINE                         │
├────────────────────────────────────────────────────────────────────────┤
│ ENTRANCE (Open)                                                        │
│ Duration: 250ms [--duration-fast]                                      │
│ Curve: cubic-bezier(0.22, 1, 0.36, 1) [--ease-smooth-out]              │
│ Scale: 0.96 (Modal) / 0.97 (Dropdown)  ───► Settles to 1.00           │
│ Opacity: 0.00                         ───► Settles to 1.00             │
├────────────────────────────────────────────────────────────────────────┤
│ EXIT (Close)                                                           │
│ Duration: 150ms [--duration-quick]  (40% faster!)                      │
│ Curve: cubic-bezier(0.22, 1, 0.36, 1) [--ease-smooth-out]              │
│ Scale: 1.00 ───► 0.96 (Modal) / 0.99 (Dropdown)                        │
│ Opacity: 1.00 ───► 0.00                                                │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Modal Dialogs (`DialogPopup` & `DialogBackdrop`)
Base UI supports entrance and exit transitions via `data-starting-style` and `data-ending-style`. The implementation binds asymmetric CSS properties directly:

```css
/* Modal Backdrop Asymmetry */
[data-slot="dialog-backdrop"] {
  transition: opacity var(--modal-open-dur) var(--modal-ease);
}
[data-slot="dialog-backdrop"][data-starting-style] {
  opacity: 0;
}
[data-slot="dialog-backdrop"][data-ending-style] {
  opacity: 0;
  transition: opacity var(--modal-close-dur) var(--modal-ease);
}

/* Modal Popup Asymmetry */
[data-slot="dialog-popup"] {
  transform: scale(1);
  opacity: 1;
  transition:
    transform var(--modal-open-dur) var(--modal-ease),
    opacity   var(--modal-open-dur) var(--modal-ease);
  will-change: transform, opacity;
}
[data-slot="dialog-popup"][data-starting-style] {
  transform: scale(var(--modal-scale));
  opacity: 0;
}
[data-slot="dialog-popup"][data-ending-style] {
  transform: scale(var(--modal-scale-close));
  opacity: 0;
  transition:
    transform var(--modal-close-dur) var(--modal-ease),
    opacity   var(--modal-close-dur) var(--modal-ease);
}

/* Mobile bottom-stick sheet variation */
@media (max-width: 639px) {
  [data-slot="dialog-popup"][data-starting-style] {
    transform: translateY(var(--distance-medium));
    opacity: 0;
  }
  [data-slot="dialog-popup"][data-ending-style] {
    transform: translateY(var(--distance-medium));
    opacity: 0;
    transition:
      transform var(--modal-close-dur) var(--modal-ease),
      opacity   var(--modal-close-dur) var(--modal-ease);
  }
}
```

### 4.2 Menu Dropdowns & Popovers (`SelectPopup`, `PopoverPopup`)
Dropdowns anchor to their trigger and grow outward from `origin-(--transform-origin)`:

```css
[data-slot="popover-popup"],
[data-slot="select-popup"] {
  transform: scale(1);
  opacity: 1;
  transition:
    transform var(--dropdown-open-dur) var(--dropdown-ease),
    opacity   var(--dropdown-open-dur) var(--dropdown-ease);
  will-change: transform, opacity;
}
[data-slot="popover-popup"][data-starting-style],
[data-slot="select-popup"][data-starting-style] {
  transform: scale(var(--dropdown-pre-scale));
  opacity: 0;
}
[data-slot="popover-popup"][data-ending-style],
[data-slot="select-popup"][data-ending-style] {
  transform: scale(var(--dropdown-closing-scale));
  opacity: 0;
  transition:
    transform var(--dropdown-close-dur) var(--dropdown-ease),
    opacity   var(--dropdown-close-dur) var(--dropdown-ease);
}
```

### 4.3 Symmetric Exceptions (Do NOT Split)
The following elements must preserve identical timings and easings in both directions because they represent continuous, reversible state changes rather than an open/close dismissal:
1. **Tabs Sliding Indicator**: `250ms` (`--duration-fast`) with `--ease-smooth-out`.
2. **Page Side-by-Side Slide**: `200ms` (`--page-slide-dur`) with `--ease-smooth-out`.
3. **Icon Cross-Fade Swap**: `200ms` (`--icon-swap-dur`) with `--ease-in-out`.
4. **Text States Swap**: `200ms` (`--text-swap-dur`) with `--ease-out`.

---

## 5. Micro-Interactions & Tactile Feedback

Micro-interactions make the application feel responsive, solid, and tactile.

### 5.1 Card & Feature Shell Elevation
Instead of abrupt shadow pop-ins, cards elevate smoothly:
```css
.feature-card,
[data-slot="card"] {
  transition:
    transform var(--duration-quick) var(--ease-smooth-out),
    box-shadow var(--duration-quick) var(--ease-smooth-out),
    border-color var(--duration-quick) var(--ease-smooth-out);
}
.feature-card:hover,
[data-slot="card"]:hover {
  transform: translateY(-2px);
}
```

### 5.2 Button Hover & Active Tap Dynamics
Buttons feel physically pressable with snappy active state compression:
```css
button,
[data-slot="button"] {
  transition:
    background-color var(--duration-quick) var(--ease-smooth-out),
    border-color var(--duration-quick) var(--ease-smooth-out),
    color var(--duration-quick) var(--ease-smooth-out),
    transform var(--duration-micro) var(--ease-smooth-out),
    box-shadow var(--duration-quick) var(--ease-smooth-out);
}
button:active:not(:disabled),
[data-slot="button"]:active:not(:disabled) {
  transform: scale(var(--scale-small));
}
```

### 5.3 Avatar Stack Hover-Out Settle
In the landlord navigation bar or tenant lists, avatars lift quickly on hover and settle with a natural spring bounce on exit:
```css
.t-avatar {
  transition: transform var(--duration-quick) var(--ease-smooth-out);
}
.t-avatar:hover {
  transform: translateY(var(--avatar-lift)) scale(var(--avatar-scale));
}
.t-avatar:not(:hover) {
  transition: transform var(--duration-fast) var(--ease-bounce-strong);
}
```

### 5.4 Nav-Link Active Underline Slide
Replace ad-hoc `170ms ease` with calibrated token variables:
```css
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 100%;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, var(--lagoon), #7ed3bf);
  transition: transform var(--duration-quick) var(--ease-smooth-out);
}
.nav-link:hover::after,
.nav-link.is-active::after {
  transform: scaleX(1);
}
```

---

## 6. Bounded Stagger Architecture (< 300ms Total)

### 6.1 The Mathematical Stagger Ceiling Rule
Human perception identifies sequential delay as sluggish when the final item arrives > 300ms after the first item. We define the **Stagger Ceiling Invariant**:

$$\text{Total Stagger Delay} = (\min(\text{Item Count}, N_{\max}) - 1) \times \Delta_{\text{stagger}} < 300\text{ms}$$

Setting $\Delta_{\text{stagger}} = 40\text{ms}$ (`--duration-stagger`) and capping $N_{\max} = 6$:
$$\text{Max Total Stagger} = 5 \times 40\text{ms} = 200\text{ms} \ll 300\text{ms}$$

Any element with index $\ge 6$ receives the capped delay of $200\text{ms}$.

### 6.2 Stagger Utility Classes
```css
.stagger-item {
  animation: surface-rise var(--duration-fast) var(--ease-smooth-out) both;
}
.stagger-1 { animation-delay: calc(var(--duration-stagger) * 0); } /* 0ms */
.stagger-2 { animation-delay: calc(var(--duration-stagger) * 1); } /* 40ms */
.stagger-3 { animation-delay: calc(var(--duration-stagger) * 2); } /* 80ms */
.stagger-4 { animation-delay: calc(var(--duration-stagger) * 3); } /* 120ms */
.stagger-5 { animation-delay: calc(var(--duration-stagger) * 4); } /* 160ms */
.stagger-6 { animation-delay: calc(var(--duration-stagger) * 5); } /* 200ms */

@keyframes surface-rise {
  from {
    opacity: 0;
    transform: translateY(var(--distance-base));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 6.3 Target Applications
1. **Dashboard Statistics Grid** (4 items):
   - Total Collected (`stagger-1`, 0ms)
   - Total Outstanding (`stagger-2`, 40ms)
   - Active Leases (`stagger-3`, 80ms)
   - Overdue Invoices (`stagger-4`, 120ms)
   *Total stagger = 120ms.*
2. **Properties / Rooms / Tenants / Leases Cards**:
   - First 6 cards receive `stagger-1` through `stagger-6`. Subsequent cards mount at the capped `200ms` delay.
3. **Table Rows (Dashboard & Invoices)**:
   - First 5 visible table rows staggered at `30ms` offset: $0\text{ms}, 30\text{ms}, 60\text{ms}, 90\text{ms}, 120\text{ms}$ ($< 150\text{ms}$ total).

---

## 7. Financial & Metric Number Pop-in

Financial figures in the Landlord Portal (Total Collected, Outstanding, Due, Paisa-to-NPR conversions) update dynamically. Rather than static text updates, numbers pop in with individual digit blurring and vertical travel.

```
     1         2         ,         5         0         0
   ┌───┐     ┌───┐     ┌───┐     ┌───┐     ┌───┐     ┌───┐
   │ 1 │     │ 2 │     │ , │     │ 5 │     │ 0 │     │ 0 │
   └───┘     └───┘     └───┘     └───┘     └───┘     └───┘
     ▲         ▲         ▲         ▲         ▲         ▲
  (0ms)     (0ms)     (0ms)     (0ms)     (70ms)    (140ms)
                                       [Stagger 1][Stagger 2]
```

### 7.1 CSS Implementation
```css
@keyframes t-digit-pop-in {
  0% {
    transform: translate(
      calc(var(--digit-distance) * var(--digit-dir-x)),
      calc(var(--digit-distance) * var(--digit-dir-y))
    );
    opacity: 0;
    filter: blur(var(--digit-blur));
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
    filter: blur(0);
  }
}

.t-digit-group {
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
.t-digit {
  display: inline-block;
  will-change: transform, opacity, filter;
}
.t-digit-group.is-animating .t-digit {
  animation: t-digit-pop-in var(--digit-dur) var(--digit-ease) both;
}
.t-digit-group.is-animating .t-digit[data-stagger="1"] {
  animation-delay: var(--digit-stagger);
}
.t-digit-group.is-animating .t-digit[data-stagger="2"] {
  animation-delay: calc(var(--digit-stagger) * 2);
}
```

### 7.2 Reusable React Component Helper
```tsx
export function AnimatedNumber({ value }: { value: string | number }) {
  const str = String(value)
  const chars = str.split('')

  return (
    <span className="t-digit-group is-animating" aria-label={str}>
      {chars.map((char, index) => {
        let stagger: string | undefined
        if (index === chars.length - 2) stagger = '1'
        if (index === chars.length - 1) stagger = '2'

        return (
          <span
            key={`${index}-${char}`}
            className="t-digit"
            data-stagger={stagger}
            aria-hidden="true"
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
```

---

## 8. Form Validation Error State Shake

When a landlord submits an invalid form (e.g., negative payment amount, cash overpayment beyond invoice balance, empty property title, duplicate tenant phone number), the input executes a percussive shake with automatic color reversion.

### 8.1 Multi-Segment Keyframe Mechanics
Total duration = $2 \times 80\text{ms} + 2 \times 60\text{ms} = 280\text{ms}$:
- `0.00%`: Rest at $x = 0$
- `28.57%`: Leg 1 (right peak, $+6\text{px}$) over $80\text{ms}$ with `--shake-ease`
- `57.14%`: Leg 2 (left peak, $-6\text{px}$) over $80\text{ms}$ with `--shake-ease`
- `78.57%`: Leg 3 (overshoot right, $+4\text{px}$) over $60\text{ms}$ with `--shake-ease`
- `100.0%`: Leg 4 (rest at $x = 0$) over $60\text{ms}$

### 8.2 CSS Implementation
```css
.t-input {
  transition: border-color var(--duration-quick) var(--ease-out);
  will-change: transform;
}
.t-input.is-error {
  transition: border-color var(--revert-dur) var(--ease-out);
  border-color: var(--destructive);
}

.t-error-msg {
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--revert-dur) var(--ease-out),
    visibility 0s linear var(--revert-dur);
}
.t-input-wrap.is-error .t-error-msg {
  opacity: 1;
  visibility: visible;
  transition:
    opacity var(--revert-dur) var(--ease-out),
    visibility 0s linear 0s;
}

.t-input.is-shaking {
  animation: t-input-shake calc(
    var(--shake-dur-a) * 2 + var(--shake-dur-b) * 2
  ) linear;
}
@keyframes t-input-shake {
  0%     { transform: translateX(0);                             animation-timing-function: var(--shake-ease); }
  28.57% { transform: translateX(var(--shake-distance));         animation-timing-function: var(--shake-ease); }
  57.14% { transform: translateX(calc(var(--shake-distance) * -1)); animation-timing-function: var(--shake-ease); }
  78.57% { transform: translateX(var(--shake-overshoot));        animation-timing-function: var(--shake-ease); }
  100%   { transform: translateX(0); }
}
```

### 8.3 React Hook Integration
```ts
export function useErrorShake() {
  const [isShaking, setIsShaking] = useState(false)
  const [isError, setIsError] = useState(false)

  const triggerShake = useCallback(() => {
    setIsError(true)
    setIsShaking(false)
    // Reflow guaranteed via microtask or double state tick
    setTimeout(() => {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 300)
    }, 16)
  }, [])

  const clearError = useCallback(() => {
    setIsError(false)
    setIsShaking(false)
  }, [])

  return { isError, isShaking, triggerShake, clearError }
}
```

---

## 9. Confirmation & Celebration: Success Check

Confirmations should feel earned. When a cash payment is registered (`recordCashPaymentFn`) or a manual invoice is created (`createManualInvoiceFn`), a composite celebration plays.

```
       Rotate (80° ──► 0°)
    ┌──────────────────────┐
    │     ╭──────────╮     │   Bob (Translate Y 40px ──► 0)
    │     │    ✔     │     │   Stroke Draw (Offset 20 ──► 0)
    │     ╰──────────╯     │   Blur (10px ──► 0)
    └──────────────────────┘
```

### 9.1 CSS Implementation
```css
.t-success-check {
  display: inline-block;
  transform-origin: center;
  opacity: 0;
  will-change: transform, opacity, filter;
}
.t-success-check svg {
  display: block;
  overflow: visible;
}
.t-success-check svg path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
}
.t-success-check[data-state="in"] {
  animation:
    t-check-fade   var(--check-opacity-dur) var(--check-ease-opacity) forwards,
    t-check-rotate var(--check-rotate-dur)  var(--check-ease-rotate)  forwards,
    t-check-blur   var(--check-blur-dur)    var(--check-ease-out)     forwards,
    t-check-bob    var(--check-bob-dur)     var(--check-ease-bob)     forwards;
}
.t-success-check[data-state="in"] svg path {
  animation: t-check-draw var(--check-path-dur) var(--check-ease-path) var(--check-path-delay) forwards;
}

@keyframes t-check-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes t-check-rotate {
  from { transform: rotate(var(--check-rotate-from)); }
  to   { transform: rotate(0deg); }
}
@keyframes t-check-blur {
  from { filter: blur(var(--check-blur-from)); }
  to   { filter: blur(0); }
}
@keyframes t-check-bob {
  from { translate: 0 var(--check-y-amount); }
  to   { translate: 0 0; }
}
@keyframes t-check-draw { to { stroke-dashoffset: 0; } }
```

---

## 10. Universal Accessibility (`prefers-reduced-motion: reduce`)

Accessibility is non-negotiable. When the operating system signals that the user prefers reduced motion, animations must immediately settle to their final state without visual distraction or vestibular triggers.

### 10.1 Guaranteed Neutralization Rule
- `animation: none !important;`
- `transition: none !important;`
- `transform: none !important;`
- `filter: none !important;`
- `opacity: 1 !important;` (for elements whose resting state is visible).

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .t-dropdown,
  .t-modal,
  .t-badge,
  .t-badge-dot,
  .t-digit-group .t-digit,
  .t-input,
  .t-success-check,
  .t-success-check svg path,
  .stagger-item,
  .rise-in,
  [data-slot="dialog-popup"],
  [data-slot="dialog-backdrop"],
  [data-slot="popover-popup"],
  [data-slot="select-popup"] {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    filter: none !important;
  }

  .t-success-check {
    opacity: 1 !important;
  }
  .t-success-check svg path {
    stroke-dashoffset: 0 !important;
  }
}
```

---

## 11. Proposed Drop-in Motion CSS for `src/styles.css`

Below is the complete, self-contained CSS block designed to be integrated into `src/styles.css`. It incorporates all tokens, transitions, asymmetric rules, keyframes, and the accessibility guard.

```css
/* ==========================================================================
   GHAR-BHANDAA MOTION & ANIMATION SYSTEM (transitions.dev & transitions-polish)
   ========================================================================== */

:root {
  /* --- Durations --- */
  --duration-stagger: 40ms;       /* per-item stagger offset */
  --duration-micro: 80ms;         /* tooltip/path delay, shake segment, active tap */
  --duration-quick: 150ms;        /* modal/dropdown close, hover in/out, tooltip appear */
  --duration-fast: 250ms;         /* dropdown/modal open, tabs sliding, page slide */
  --duration-medium: 350ms;       /* panel close, toast dismiss */
  --duration-slow: 400ms;         /* panel/drawer open, skeleton reveal */
  --duration-very-slow: 500ms;    /* number pop-in, badge appear, success check */

  /* --- Easings --- */
  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1);    /* default surface curve */
  --ease-in-out: ease-in-out;                           /* icon/text swap */
  --ease-out: ease-out;                                 /* tooltip/fade */
  --ease-linear: linear;                                /* spinners, shimmers */
  --ease-bounce: cubic-bezier(0.34, 1.36, 0.64, 1);     /* badge pop */
  --ease-bounce-strong: cubic-bezier(0.34, 3.85, 0.64, 1); /* bouncy avatar return */

  /* --- Distances --- */
  --distance-micro: 4px;          /* text swap, shake overshoot */
  --distance-small: 6px;          /* error shake primary segment */
  --distance-base: 8px;           /* page slide, number pop-in travel */
  --distance-medium: 12px;        /* surface rise-in, mobile dialog sheet offset */
  --distance-large: 30px;         /* celebratory check burst */

  /* --- Scales --- */
  --scale-large: 0.96;            /* modal open/close pre-scale */
  --scale-medium: 0.97;           /* dropdown open pre-scale */
  --scale-small: 0.98;            /* active button press, tooltip */
  --scale-tiny: 0.99;             /* dropdown close pre-scale */

  /* --- Blurs --- */
  --blur-small: 2px;              /* number pop-in, badge blur */
  --blur-medium: 3px;             /* page slide, surface cross-fade */
  --blur-large: 8px;              /* success check burst */

  /* --- Component Semantic Mappings --- */
  --modal-open-dur: var(--duration-fast);
  --modal-close-dur: var(--duration-quick);
  --modal-scale: var(--scale-large);
  --modal-scale-close: var(--scale-large);
  --modal-ease: var(--ease-smooth-out);

  --dropdown-open-dur: var(--duration-fast);
  --dropdown-close-dur: var(--duration-quick);
  --dropdown-pre-scale: var(--scale-medium);
  --dropdown-closing-scale: var(--scale-tiny);
  --dropdown-ease: var(--ease-smooth-out);

  --digit-dur: var(--duration-very-slow);
  --digit-distance: var(--distance-base);
  --digit-stagger: 70ms;
  --digit-blur: var(--blur-small);
  --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1);
  --digit-dir-x: 0;
  --digit-dir-y: 1;

  --shake-distance: var(--distance-small);
  --shake-overshoot: var(--distance-micro);
  --shake-dur-a: var(--duration-micro);
  --shake-dur-b: 60ms;
  --shake-ease: var(--ease-smooth-out);
  --revert-hold: 3000ms;
  --revert-dur: 280ms;

  --check-opacity-dur: 550ms;
  --check-rotate-dur: 550ms;
  --check-rotate-from: 80deg;
  --check-bob-dur: 450ms;
  --check-y-amount: 40px;
  --check-blur-dur: var(--duration-very-slow);
  --check-blur-from: 10px;
  --check-path-dur: 550ms;
  --check-path-delay: var(--duration-micro);
  --check-ease-out: var(--ease-smooth-out);
  --check-ease-opacity: var(--ease-smooth-out);
  --check-ease-rotate: var(--ease-smooth-out);
  --check-ease-bob: cubic-bezier(0.34, 1.35, 0.64, 1);
  --check-ease-path: var(--ease-smooth-out);

  --badge-slide-dur: 260ms;
  --badge-pop-dur: var(--duration-very-slow);
  --badge-pop-close-dur: 180ms;
  --badge-fade-dur: var(--duration-slow);
  --badge-fade-close-dur: 180ms;
  --badge-blur: var(--blur-small);
  --badge-offset-x: -8.2px;
  --badge-offset-y: 12.4px;
  --badge-slide-ease: var(--ease-smooth-out);
  --badge-pop-ease: var(--ease-bounce);
  --badge-close-ease: cubic-bezier(0.4, 0, 0.2, 1);

  --avatar-lift: -4px;
  --avatar-dur: 320ms;
  --avatar-scale: 1.05;
  --avatar-falloff: 0.45;
  --avatar-ease-in: var(--ease-smooth-out);
  --avatar-ease-out: var(--ease-bounce-strong);
}

/* --- Base Interactive Micro-interactions --- */
button,
.island-shell,
a {
  transition:
    background-color var(--duration-quick) var(--ease-smooth-out),
    color var(--duration-quick) var(--ease-smooth-out),
    border-color var(--duration-quick) var(--ease-smooth-out),
    transform var(--duration-quick) var(--ease-smooth-out),
    box-shadow var(--duration-quick) var(--ease-smooth-out);
}

button:active:not(:disabled),
[data-slot="button"]:active:not(:disabled) {
  transform: scale(var(--scale-small));
}

.feature-card:hover,
[data-slot="card"]:hover {
  transform: translateY(-2px);
  transition:
    transform var(--duration-quick) var(--ease-smooth-out),
    box-shadow var(--duration-quick) var(--ease-smooth-out),
    border-color var(--duration-quick) var(--ease-smooth-out);
}

.nav-link::after {
  transition: transform var(--duration-quick) var(--ease-smooth-out);
}

/* --- Calibrated Surface Rise-In Entrance --- */
.rise-in {
  animation: surface-rise var(--duration-fast) var(--ease-smooth-out) both;
}

@keyframes surface-rise {
  from {
    opacity: 0;
    transform: translateY(var(--distance-base));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Bounded Stagger Classes (< 300ms Total) --- */
.stagger-item {
  animation: surface-rise var(--duration-fast) var(--ease-smooth-out) both;
}
.stagger-1 { animation-delay: 0ms; }
.stagger-2 { animation-delay: calc(var(--duration-stagger) * 1); } /* 40ms */
.stagger-3 { animation-delay: calc(var(--duration-stagger) * 2); } /* 80ms */
.stagger-4 { animation-delay: calc(var(--duration-stagger) * 3); } /* 120ms */
.stagger-5 { animation-delay: calc(var(--duration-stagger) * 4); } /* 160ms */
.stagger-6 { animation-delay: calc(var(--duration-stagger) * 5); } /* 200ms */

/* --- Asymmetric Base UI Modal Dialog Transitions --- */
[data-slot="dialog-backdrop"] {
  transition: opacity var(--modal-open-dur) var(--modal-ease);
}
[data-slot="dialog-backdrop"][data-starting-style] {
  opacity: 0;
}
[data-slot="dialog-backdrop"][data-ending-style] {
  opacity: 0;
  transition: opacity var(--modal-close-dur) var(--modal-ease);
}

[data-slot="dialog-popup"] {
  transform: scale(1);
  opacity: 1;
  transition:
    transform var(--modal-open-dur) var(--modal-ease),
    opacity   var(--modal-open-dur) var(--modal-ease);
  will-change: transform, opacity;
}
[data-slot="dialog-popup"][data-starting-style] {
  transform: scale(var(--modal-scale));
  opacity: 0;
}
[data-slot="dialog-popup"][data-ending-style] {
  transform: scale(var(--modal-scale-close));
  opacity: 0;
  transition:
    transform var(--modal-close-dur) var(--modal-ease),
    opacity   var(--modal-close-dur) var(--modal-ease);
}

@media (max-width: 639px) {
  [data-slot="dialog-popup"][data-starting-style] {
    transform: translateY(var(--distance-medium));
    opacity: 0;
  }
  [data-slot="dialog-popup"][data-ending-style] {
    transform: translateY(var(--distance-medium));
    opacity: 0;
    transition:
      transform var(--modal-close-dur) var(--modal-ease),
      opacity   var(--modal-close-dur) var(--modal-ease);
  }
}

/* --- Asymmetric Base UI Popover & Select Dropdowns --- */
[data-slot="popover-popup"],
[data-slot="select-popup"] {
  transform: scale(1);
  opacity: 1;
  transition:
    transform var(--dropdown-open-dur) var(--dropdown-ease),
    opacity   var(--dropdown-open-dur) var(--dropdown-ease);
  will-change: transform, opacity;
}
[data-slot="popover-popup"][data-starting-style],
[data-slot="select-popup"][data-starting-style] {
  transform: scale(var(--dropdown-pre-scale));
  opacity: 0;
}
[data-slot="popover-popup"][data-ending-style],
[data-slot="select-popup"][data-ending-style] {
  transform: scale(var(--dropdown-closing-scale));
  opacity: 0;
  transition:
    transform var(--dropdown-close-dur) var(--dropdown-ease),
    opacity   var(--dropdown-close-dur) var(--dropdown-ease);
}

/* --- Number Pop-In for Financial Metrics --- */
@keyframes t-digit-pop-in {
  0% {
    transform: translate(
      calc(var(--digit-distance) * var(--digit-dir-x)),
      calc(var(--digit-distance) * var(--digit-dir-y))
    );
    opacity: 0;
    filter: blur(var(--digit-blur));
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
    filter: blur(0);
  }
}

.t-digit-group {
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
.t-digit {
  display: inline-block;
  will-change: transform, opacity, filter;
}
.t-digit-group.is-animating .t-digit {
  animation: t-digit-pop-in var(--digit-dur) var(--digit-ease) both;
}
.t-digit-group.is-animating .t-digit[data-stagger="1"] {
  animation-delay: var(--digit-stagger);
}
.t-digit-group.is-animating .t-digit[data-stagger="2"] {
  animation-delay: calc(var(--digit-stagger) * 2);
}

/* --- Form Validation Error State Shake --- */
.t-input {
  transition: border-color var(--duration-quick) var(--ease-out);
  will-change: transform;
}
.t-input.is-error {
  transition: border-color var(--revert-dur) var(--ease-out);
}
.t-error-msg {
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--revert-dur) var(--ease-out),
    visibility 0s linear var(--revert-dur);
}
.t-input-wrap.is-error .t-error-msg {
  opacity: 1;
  visibility: visible;
  transition:
    opacity var(--revert-dur) var(--ease-out),
    visibility 0s linear 0s;
}
.t-input.is-shaking {
  animation: t-input-shake calc(
    var(--shake-dur-a) * 2 + var(--shake-dur-b) * 2
  ) linear;
}
@keyframes t-input-shake {
  0%     { transform: translateX(0);                                animation-timing-function: var(--shake-ease); }
  28.57% { transform: translateX(var(--shake-distance));            animation-timing-function: var(--shake-ease); }
  57.14% { transform: translateX(calc(var(--shake-distance) * -1)); animation-timing-function: var(--shake-ease); }
  78.57% { transform: translateX(var(--shake-overshoot));           animation-timing-function: var(--shake-ease); }
  100%   { transform: translateX(0); }
}

/* --- Confirmation Success Check --- */
.t-success-check {
  display: inline-block;
  transform-origin: center;
  opacity: 0;
  will-change: transform, opacity, filter;
}
.t-success-check svg {
  display: block;
  overflow: visible;
}
.t-success-check svg path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
}
.t-success-check[data-state="in"] {
  animation:
    t-check-fade   var(--check-opacity-dur) var(--check-ease-opacity) forwards,
    t-check-rotate var(--check-rotate-dur)  var(--check-ease-rotate)  forwards,
    t-check-blur   var(--check-blur-dur)    var(--check-ease-out)     forwards,
    t-check-bob    var(--check-bob-dur)     var(--check-ease-bob)     forwards;
}
.t-success-check[data-state="in"] svg path {
  animation: t-check-draw var(--check-path-dur) var(--check-ease-path) var(--check-path-delay) forwards;
}
@keyframes t-check-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes t-check-rotate {
  from { transform: rotate(var(--check-rotate-from)); }
  to   { transform: rotate(0deg); }
}
@keyframes t-check-blur {
  from { filter: blur(var(--check-blur-from)); }
  to   { filter: blur(0); }
}
@keyframes t-check-bob {
  from { translate: 0 var(--check-y-amount); }
  to   { translate: 0 0; }
}
@keyframes t-check-draw { to { stroke-dashoffset: 0; } }

/* --- Notification Badge Slide & Pop --- */
.t-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  pointer-events: none;
  will-change: transform;
}
.t-badge[data-open="true"] {
  animation: t-badge-slide-in var(--badge-slide-dur) var(--badge-slide-ease);
}
@keyframes t-badge-slide-in {
  from { transform: translate(var(--badge-offset-x), var(--badge-offset-y)); }
  to   { transform: translate(0, 0); }
}
.t-badge-dot {
  display: block;
  transform-origin: center;
  transform: scale(1);
  opacity: 1;
  filter: blur(0);
  transition:
    transform var(--badge-pop-dur)  var(--badge-pop-ease),
    opacity   var(--badge-fade-dur) var(--badge-pop-ease),
    filter    var(--badge-pop-dur)  var(--badge-pop-ease);
  will-change: transform, opacity, filter;
}
.t-badge[data-open="false"] .t-badge-dot {
  transform: scale(0);
  opacity: 0;
  filter: blur(var(--badge-blur));
  transition:
    transform var(--badge-pop-close-dur)  var(--badge-close-ease),
    opacity   var(--badge-fade-close-dur) var(--badge-close-ease),
    filter    var(--badge-pop-close-dur)  var(--badge-close-ease);
}

/* --- Global Prefers-Reduced-Motion Guard --- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .t-dropdown,
  .t-modal,
  .t-badge,
  .t-badge-dot,
  .t-digit-group .t-digit,
  .t-input,
  .t-success-check,
  .t-success-check svg path,
  .stagger-item,
  .rise-in,
  [data-slot="dialog-popup"],
  [data-slot="dialog-backdrop"],
  [data-slot="popover-popup"],
  [data-slot="select-popup"] {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    filter: none !important;
  }

  .t-success-check {
    opacity: 1 !important;
  }
  .t-success-check svg path {
    stroke-dashoffset: 0 !important;
  }
}
```

---

## 12. Integration Guidance for Implementers

### 12.1 Steps for Implementer Agent
1. **Append Motion Tokens & Keyframes**: Drop Section 11 into `src/styles.css`, replacing legacy `180ms`/`170ms` transitions and unifying `.rise-in`.
2. **Update Dialog and Popover Primitives**:
   - In `src/components/ui/dialog.tsx`: bind `[data-slot="dialog-backdrop"]` and `[data-slot="dialog-popup"]` to the asymmetric `--modal-open-dur` (250ms) and `--modal-close-dur` (150ms).
   - In `src/components/ui/popover.tsx` & `select.tsx`: ensure popup classes bind to `--dropdown-open-dur` and `--dropdown-close-dur`.
3. **Equip Dashboard & Invoices with Number Pop-In**:
   - Wrap financial values in `AnimatedNumber` component or `.t-digit-group` container on `/dashboard` and `/invoices/$invoiceId`.
4. **Apply Bounded Staggers**:
   - Attach `.stagger-item` and `.stagger-1`..`stagger-6` to the 4 stats cards on `/dashboard` and the entity cards on `/properties`, `/rooms`, `/tenants`, `/leases`.
5. **Form Error State Feedback**:
   - Connect `.t-input-wrap`, `.t-input.is-shaking`, and `.t-error-msg` to modal forms (Manual Invoice dialog, Record Cash Payment dialog, Property/Room/Tenant dialogs).
6. **Celebrate Success**:
   - Display `.t-success-check` upon successful invoice issuance or cash payment recording.
