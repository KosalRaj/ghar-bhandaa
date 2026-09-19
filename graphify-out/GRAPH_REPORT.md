# Graph Report - ghar-bhandaa  (2026-09-19)

## Corpus Check
- 108 files · ~67,977 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1154 nodes · 2283 edges · 78 communities (58 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d013c671`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 161 edges
2. `Button()` - 22 edges
3. `landlordAuthMiddleware` - 17 edges
4. `Card()` - 15 edges
5. `CardTitle()` - 15 edges
6. `Automated Room Rent Collection System — Build Plan` - 15 edges
7. `CardHeader()` - 14 edges
8. `Field()` - 14 edges
9. `FieldLabel()` - 14 edges
10. `authClient` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Drizzle ORM Config` --references--> `landlords table`  [EXTRACTED]
  drizzle.config.ts → src/db/schema.ts
- `Vite Build Config` --conceptually_related_to--> `CloudflareBindings`  [INFERRED]
  vite.config.ts → src/types/cloudflare.d.ts
- `Cloudflare Workers` --implements--> `Automated Room Rent Collection System`  [EXTRACTED]
  PLAN.md → REQUIREMENTS.md
- `Cloudflare R2` --implements--> `Automated Room Rent Collection System`  [EXTRACTED]
  PLAN.md → REQUIREMENTS.md
- `Resend` --implements--> `Automated Room Rent Collection System`  [EXTRACTED]
  PLAN.md → REQUIREMENTS.md

## Hyperedges (group relationships)
- **Rental Property Domain Model** — schema_landlords, schema_properties, schema_rooms, schema_tenants, schema_leases, schema_invoices, schema_invoiceLineItems, schema_payments, schema_notificationsLog [EXTRACTED 1.00]
- **Better Auth Tables** — schema_user, schema_session, schema_account [EXTRACTED 1.00]
- **Project Tooling Stack** — prettier_config, eslint_config, drizzle_config, vite_config [INFERRED 0.90]
- **Authenticated API Endpoints** — invoices_functions_getInvoices, invoices_functions_getInvoiceDetails, invoices_functions_createManualInvoiceFn, invoices_functions_getDashboardData, rooms_functions_getRooms, rooms_functions_createRoom, rooms_functions_updateRoom, payments_functions_recordCashPaymentFn, tenants_functions_getTenants, tenants_functions_createTenant, tenants_functions_updateTenant, leases_functions_getLeases, leases_functions_createLease, leases_functions_endLease, properties_functions_getProperties, properties_functions_createProperty, properties_functions_updateProperty [EXTRACTED 1.00]
- **Authenticated Route Group** — routes_authed, routes_authed_dashboard, routes_authed_tenants, routes_authed_properties, routes_authed_leases, routes_authed_rooms, routes_authed_invoices_invoiceId [EXTRACTED 1.00]
- **CRUD Management Pages** — routes_authed_tenants, routes_authed_properties, routes_authed_leases, routes_authed_rooms [EXTRACTED 1.00]
- **Demo Routes Group** — routes_demo_better_auth, routes_demo_drizzle [EXTRACTED 1.00]
- **Authentication Flow** — routes_login, routes_signup, routes_authed, routes_api_auth, server_auth_functions, lib_auth_client, lib_auth [INFERRED 0.90]
- **Invoice & Payment Data Flow** — routes_authed_dashboard, routes_authed_invoices_invoiceId, server_invoices_functions, server_payments_functions, lib_money, lib_dates [EXTRACTED 1.00]
- **Property Management Core Entities** — server_properties_functions, server_rooms_functions, server_tenants_functions, server_leases_functions [INFERRED 0.90]
- **Kathmandu Timezone Date Utilities** — dates_getTodayInKathmandu, dates_getCurrentDateTimeInKathmandu, dates_isPastDateInKathmandu [EXTRACTED 1.00]
- **NPR/Paisa Currency Conversion Utils** — money_nprToPaisa, money_paisaToNpr, money_formatNpr [EXTRACTED 1.00]
- **Invoice and Payment Server-Side Pipeline** — payments_recordCashPayment, invoices_recalculateInvoiceStatus, invoices_createManualInvoice [INFERRED 0.90]
- **Build Phases Sequence** — PLAN_Phase0, PLAN_Phase1, PLAN_Phase2, PLAN_Phase3, PLAN_Phase4, PLAN_Phase5, PLAN_Phase6 [EXTRACTED 1.00]
- **Three Entry Points Architecture** — PLAN_ServerFunctions, PLAN_ScheduledHandler, PLAN_PublicWebhookRoutes [EXTRACTED 1.00]
- **Domain Invariants** — PLAN_IntegerPaisaInvariant, PLAN_DerivedStatusInvariant, PLAN_IdempotentGenerationInvariant, PLAN_AppendOnlyLedgerInvariant, PLAN_WebhookVerificationInvariant [EXTRACTED 1.00]
- **Nepali Payment Gateways** — REQUIREMENTS_Khalti, REQUIREMENTS_eSewa [EXTRACTED 1.00]
- **Tech Stack Selection** — PLAN_TanStackStart, PLAN_CloudflareWorkers, PLAN_CloudflareD1, PLAN_DrizzleORM, PLAN_BetterAuth, PLAN_CloudflareR2, PLAN_CronTriggers, PLAN_Resend, PLAN_SparrowSMS, PLAN_Zod, PLAN_TailwindCSS [EXTRACTED 1.00]

## Communities (78 total, 20 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (71): authClient, registerLandlord, getLeases, getProperties, getRooms, getTenants, Alert(), AlertDescription() (+63 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (49): 1. Installation, 2. Configure Environment Variables, 3. Initialize Local Database, 4. Start Development Server, Adding a Database (Optional), Adding A Route, Adding Links, API Routes (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (43): 1.1 Required Tools, 1.2 Initial Installation, 1.3 Environment Variables Configuration, 1. Prerequisites & Environment Setup, 2.1 Database Configuration Files, 2.2 Schema Migration Workflow, 2. Cloudflare D1 Database & Drizzle Migrations, 3. Local Development (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (40): actual, alertPopup, confirmBtn, { container }, cssPath, desktopNav, desktopTable, desktopTableWrapper (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (30): atomicDb, bobInvoice, bobLease, columns, invoice, InvoiceRecord, landlordsConfig, landlordsEmailCol (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): Route, addItemBtn, amountInput, closeButton, comboboxes, { container }, { container, rerender }, ctaButtons (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (34): LandingPage(), LoginPage(), SignupPage(), btn, card, { container }, { container, unmount }, css (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (36): Append-Only Payment Ledger, Bank Transfer Verification Flow, Better Auth, Cloudflare D1 (SQLite), Cloudflare R2, Cloudflare Workers, Cloudflare Cron Triggers, Derived Invoice Status Rule (+28 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (33): 10. Build phases, 11. Environment & secrets, 12. Gotchas (read before coding), 13. Testing strategy, 14. Suggested agentic AI workflow, 1. How an AI agent should use this document, 2. Product overview, 3. Technology stack (decided — do not substitute) (+25 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (31): 1. Executive Summary, 2. Master Findings Matrix, 3.10 AUTH-01: Non-Atomic Registration Rollback (Severity: LOW), 3.11 LNK-01: Dead Link to Demo Page in Header (Severity: LOW), 3.1 SEC-01: Cross-Tenant Property Association in `createRoom` (Severity: HIGH), 3.2 SEC-02: Cross-Tenant Room & Tenant Association in `createLease` (Severity: HIGH), 3.3 INV-01: Flawed Global Outstanding Balance Calculation (Severity: HIGH), 3.4 FIN-01: Unbounded Cash Overpayments in `recordCashPayment` (Severity: HIGH) (+23 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (32): createManualInvoiceFn Server Function, getDashboardData Server Function, getInvoiceDetails Server Function, getInvoices Server Function, createLease Server Function, endLease Server Function, getLeases Server Function, createManualInvoice (+24 more)

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (30): Route, Route, alertDialog, cancelBtn, checkPath, confirmButton, { container }, createCta (+22 more)

### Community 12 - "Community 12"
Cohesion: 0.1
Nodes (25): payments, addDaysInKathmandu(), getCurrentDateTimeInKathmandu(), getTodayInKathmandu(), isPastDateInKathmandu(), CreateManualInvoiceInput, recalculateInvoiceStatus(), fixedDate (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.07
Nodes (28): Route, Route, Route, Route, Route, AboutRoute, ApiAuthSplatRoute, AuthedDashboardRoute (+20 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (28): 10. Billing Day Range Limitation, 1. Nepal / Kathmandu Timezone Handling (`Asia/Kathmandu`, UTC+05:45), 1. Server Functions RPC Layer (`src/server/*.functions.ts`), 1. System Overview & Technology Stack, 2. Monetary Amounts & Integer Paisa Arithmetic, 2. Scheduled Handlers (Cloudflare Cron Triggers), 2. The Three-Entry-Point Architectural Model, 3. Append-Only Payment Ledger & Financial Integrity (+20 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (26): addonLabel, alertHtml, btn, { container }, { container, rerender }, css, dialogHtml, digits (+18 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (25): directionMap, Drawer(), DrawerBackdrop(), DrawerBar(), DrawerClose(), DrawerContext, DrawerDescription(), DrawerFooter() (+17 more)

### Community 17 - "Community 17"
Cohesion: 0.09
Nodes (24): cn(), AlertAction(), AlertTitle(), Avatar(), AvatarFallback(), AvatarImage(), CardAction(), CardFrame() (+16 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (27): 1. Purpose & scope, 2. Actors, 3.1 Accounts & authentication, 3.2 Property, room, tenant & lease management, 3.3 Invoice generation & billing, 3.4 Payments — online wallets, 3.5 Payments — bank transfer & verification, 3.6 Payment integrity (+19 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (28): Database Instance, Todos DB Schema, Auth Library (getAuth), Better Auth Client, Date Utilities (Kathmandu), Money Format Utilities, About Route, Auth API Handler Route (+20 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (19): account, invoiceLineItems, invoices, leases, notificationsLog, session, tenants, user (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (21): cancelBtn, confirmBtn, { container }, cta, digits, group, handleAction, mockNavigate (+13 more)

### Community 22 - "Community 22"
Cohesion: 0.09
Nodes (21): brandLink, button, calcLink, expectedSequence, featuresLink, hasDark, hasLight, monthlyCollectionNpr (+13 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (18): css, element, id, props, MenuCheckboxItem(), MenuGroup(), MenuGroupLabel(), MenuItem() (+10 more)

### Community 24 - "Community 24"
Cohesion: 0.1
Nodes (19): Acceptance Criteria, Acceptance Criteria, Code Quality & Correctness, Deliverables & Artifacts, Follow-up — 2026-09-19T15:41:17Z, Functional & Quality Gates, Initial Request — 2026-08-26T12:20:52+05:45, Original User Request (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (12): Route, anchoredToastManager, AnchoredToastProvider(), AnchoredToastProviderProps, getSwipeDirection(), SwipeDirection, TOAST_ICONS, ToastData (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (18): getDB Factory, Drizzle ORM Config, BetterAuthHeader Component, Landlord Auth Middleware, account table, invoice_line_items table, invoices table, landlords table (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.17
Nodes (10): Database, recordCashPayment(), RecordCashPaymentInput, landlordAuthMiddleware, recordCashPaymentSchema, recordCashPaymentFn, insertedPayment, InvoiceRecord (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.19
Nodes (8): Calendar(), DatePicker(), DatePickerProps, formatDisplayDate(), PopoverDescription(), PopoverPopup(), PopoverTitle(), PopoverTrigger()

### Community 29 - "Community 29"
Cohesion: 0.2
Nodes (10): segmentedControlItemSizeClassNames, segmentedControlItemVariants, SegmentedControlSize, Tabs(), TabsList(), TabsListContext, TabsPanel(), TabsSize (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (9): createManualInvoice(), createdInvoice, InvoiceRecord, LeaseRecord, LineItemRecord, lineItems, lineItemSum, mockDb (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (10): Architecture, Code Layout, Design System ↔ Routes, Feature Inventory, Interface Contracts, Key Architectural Invariants, Milestones, Project: ghar-bhandaa Code Review, Invariant Audit & Documentation Suite (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (7): DashboardPage(), InvoiceDetailsPage(), formatNpr(), nprToPaisa(), paisaToNpr(), formatted, testCases

### Community 33 - "Community 33"
Cohesion: 0.36
Nodes (6): applyThemeMode(), getInitialMode(), ThemeMode, ThemeToggle(), TooltipPopup(), TooltipTrigger()

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (4): Route, getDB(), landlords, getAuth()

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (9): 2.6 Invoices Domain (`src/server/invoices.functions.ts`), code:typescript (Promise<), code:typescript (Promise<{), code:typescript (z.object({), code:typescript (Promise<{), `createManualInvoiceFn`, `getDashboardData`, `getInvoiceDetails` (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.36
Nodes (5): properties, createPropertySchema, updatePropertySchema, createProperty, updateProperty

### Community 37 - "Community 37"
Cohesion: 0.25
Nodes (7): 1.1 Server Functions (RPC), 1. Overview & Protocol Architecture, 3. Public Better Auth REST Endpoints (`/api/auth/*`), 4. HTTP Error Handling & Status Codes, API & Server Functions Catalog, code:typescript (// Client usage example:), code:block22 (┌───────────────────────────────────────────────────────────)

### Community 38 - "Community 38"
Cohesion: 0.38
Nodes (4): Footer(), AuthedLayout(), Route, checkLandlordAuth

### Community 39 - "Community 39"
Cohesion: 0.38
Nodes (5): rooms, createRoomSchema, updateRoomSchema, createRoom, updateRoom

### Community 40 - "Community 40"
Cohesion: 0.43
Nodes (4): createTenantSchema, updateTenantSchema, createTenant, updateTenant

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (7): 2.4 Tenants Domain (`src/server/tenants.functions.ts`), code:typescript (Array<{), code:typescript (z.object({), code:typescript (z.object({), `createTenant`, `getTenants`, `updateTenant`

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (7): 2.2 Properties Domain (`src/server/properties.functions.ts`), code:typescript (Array<{), code:typescript (z.object({), code:typescript (z.object({), `createProperty`, `getProperties`, `updateProperty`

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (7): 2.3 Rooms Domain (`src/server/rooms.functions.ts`), code:typescript (z.object({), code:typescript (Promise<), code:typescript (z.object({), `createRoom`, `getRooms`, `updateRoom`

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (7): 2.5 Leases Domain (`src/server/leases.functions.ts`), code:typescript (Promise<), code:typescript (z.object({), code:typescript (z.object({), `createLease`, `endLease`, `getLeases`

### Community 45 - "Community 45"
Cohesion: 0.48
Nodes (7): getCurrentDateTimeInKathmandu, getTodayInKathmandu, isPastDateInKathmandu, createManualInvoice, recalculateInvoiceStatus, nprToPaisa, recordCashPayment

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (7): authClient, getAuth, Header, LandlordHeader, ThemeToggle, BetterAuthHeader, cn

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (7): Phase 0: Project Setup, Phase 1: Core Records + Manual Billing, Phase 2: Automation, Phase 3: Bank Transfer + Verification, Phase 4: Online Wallet Payments, Phase 5: Hardening + Extras, Phase 6: Multi-Landlord Readiness

### Community 48 - "Community 48"
Cohesion: 0.6
Nodes (3): getRouter(), Register, routeTree

### Community 49 - "Community 49"
Cohesion: 0.4
Nodes (3): createTodo, getTodos, Route

### Community 50 - "Community 50"
Cohesion: 0.4
Nodes (4): CloudflareBindings, D1Database, D1Result, R2Bucket

### Community 51 - "Community 51"
Cohesion: 0.4
Nodes (5): 2.7 Payments Domain (`src/server/payments.functions.ts`), 2. Server Functions Catalog by Domain, code:block2 (┌───────────────────────────────────────────────────────────), code:typescript (z.object({), `recordCashPaymentFn`

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (5): 2.1 Authentication Domain (`src/server/auth.functions.ts`), `checkLandlordAuth`, code:typescript (z.object({), code:typescript (Promise<{), `registerLandlord`

### Community 53 - "Community 53"
Cohesion: 0.83
Nodes (4): checkLandlordAuth Server Function, registerLandlord Server Function, getAuth, getDB

## Knowledge Gaps
- **537 isolated node(s):** `config`, `SignupRoute`, `LoginRoute`, `AuthedRoute`, `IndexRoute` (+532 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 17` to `Community 0`, `Community 33`, `Community 32`, `Community 6`, `Community 15`, `Community 16`, `Community 21`, `Community 23`, `Community 25`, `Community 28`, `Community 29`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `formatNpr()` connect `Community 32` to `Community 0`, `Community 3`, `Community 4`, `Community 11`, `Community 12`, `Community 27`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Todos DB Schema` connect `Community 19` to `Community 49`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `config`, `SignupRoute`, `LoginRoute` to the rest of the system?**
  _537 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._