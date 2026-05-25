# Graph Report - .  (2026-05-24)

## Corpus Check
- Corpus is ~21,530 words - fits in a single context window. You may not need a graph.

## Summary
- 328 nodes · 501 edges · 33 communities (17 shown, 16 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.82)
- Token cost: 65,000 input · 16,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard & Authenticated Routes|Dashboard & Authenticated Routes]]
- [[_COMMUNITY_UI Components & Theme|UI Components & Theme]]
- [[_COMMUNITY_Server Functions & Domain Logic|Server Functions & Domain Logic]]
- [[_COMMUNITY_Auth & Utilities Layer|Auth & Utilities Layer]]
- [[_COMMUNITY_Infrastructure & Architecture Plan|Infrastructure & Architecture Plan]]
- [[_COMMUNITY_Properties & Rooms Management|Properties & Rooms Management]]
- [[_COMMUNITY_Auth & Layout Middleware|Auth & Layout Middleware]]
- [[_COMMUNITY_Core Database Schema|Core Database Schema]]
- [[_COMMUNITY_Domain Invariants & Entry Points|Domain Invariants & Entry Points]]
- [[_COMMUNITY_Tenants CRUD|Tenants CRUD]]
- [[_COMMUNITY_Drizzle Demo Page|Drizzle Demo Page]]
- [[_COMMUNITY_Date & Money Processing|Date & Money Processing]]
- [[_COMMUNITY_Header Auth Components|Header Auth Components]]
- [[_COMMUNITY_Build Phases Plan|Build Phases Plan]]
- [[_COMMUNITY_Landlord Registration & Auth|Landlord Registration & Auth]]
- [[_COMMUNITY_Linter & Formatter Config|Linter & Formatter Config]]
- [[_COMMUNITY_Prettier Config|Prettier Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Cloudflare Types|Cloudflare Types]]
- [[_COMMUNITY_Router Setup|Router Setup]]
- [[_COMMUNITY_NPR Currency Formatting|NPR Currency Formatting]]
- [[_COMMUNITY_Payment Invoice Input Types|Payment Invoice Input Types]]
- [[_COMMUNITY_Footer Component|Footer Component]]
- [[_COMMUNITY_Invoice Requirements|Invoice Requirements]]
- [[_COMMUNITY_Lease Requirements|Lease Requirements]]
- [[_COMMUNITY_Payment Requirements|Payment Requirements]]
- [[_COMMUNITY_Nepal Time Requirements|Nepal Time Requirements]]
- [[_COMMUNITY_PWA Requirements|PWA Requirements]]
- [[_COMMUNITY_Testing Strategy|Testing Strategy]]
- [[_COMMUNITY_Drizzle Logo|Drizzle Logo]]
- [[_COMMUNITY_React PWA Icon|React PWA Icon]]

## God Nodes (most connected - your core abstractions)
1. `landlordAuthMiddleware` - 17 edges
2. `Automated Room Rent Collection System` - 11 edges
3. `Authenticated Layout Guard` - 9 edges
4. `Leases CRUD Route` - 9 edges
5. `Domain Logic Layer (src/lib)` - 9 edges
6. `landlords table` - 8 edges
7. `Root Layout` - 8 edges
8. `Dashboard Route` - 8 edges
9. `landlordAuthMiddleware` - 7 edges
10. `getTodayInKathmandu()` - 7 edges

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

## Communities (33 total, 16 thin omitted)

### Community 0 - "Dashboard & Authenticated Routes"
Cohesion: 0.07
Nodes (43): DashboardPage(), Route, InvoiceDetailsPage(), Route, Route, Database, account, invoiceLineItems (+35 more)

### Community 1 - "UI Components & Theme"
Cohesion: 0.05
Nodes (28): ThemeMode, Route, authClient, Route, Route, Route, Route, getRouter() (+20 more)

### Community 2 - "Server Functions & Domain Logic"
Cohesion: 0.08
Nodes (32): createManualInvoiceFn Server Function, getDashboardData Server Function, getInvoiceDetails Server Function, getInvoices Server Function, createLease Server Function, endLease Server Function, getLeases Server Function, createManualInvoice (+24 more)

### Community 3 - "Auth & Utilities Layer"
Cohesion: 0.15
Nodes (25): Auth Library (getAuth), Better Auth Client, Date Utilities (Kathmandu), Money Format Utilities, About Route, Auth API Handler Route, Authenticated Layout Guard, Dashboard Route (+17 more)

### Community 4 - "Infrastructure & Architecture Plan"
Cohesion: 0.09
Nodes (25): Bank Transfer Verification Flow, Better Auth, Cloudflare D1 (SQLite), Cloudflare R2, Cloudflare Workers, Cloudflare Cron Triggers, Drizzle ORM, Idempotent Invoice Generation (+17 more)

### Community 5 - "Properties & Rooms Management"
Cohesion: 0.16
Nodes (12): Route, Route, createPropertySchema, updatePropertySchema, createRoomSchema, updateRoomSchema, createProperty, getProperties (+4 more)

### Community 6 - "Auth & Layout Middleware"
Cohesion: 0.18
Nodes (8): Route, getDB(), landlords, getAuth(), Route, Route, checkLandlordAuth, registerLandlord

### Community 7 - "Core Database Schema"
Cohesion: 0.18
Nodes (18): getDB Factory, Drizzle ORM Config, BetterAuthHeader Component, Landlord Auth Middleware, account table, invoice_line_items table, invoices table, landlords table (+10 more)

### Community 8 - "Domain Invariants & Entry Points"
Cohesion: 0.25
Nodes (11): Append-Only Payment Ledger, Derived Invoice Status Rule, Domain Logic Layer (src/lib), File Suffix Convention, Integer Paisa Money Rule, Public Webhook Routes Entry Point, Scheduled Handler Entry Point, Server Functions Entry Point (+3 more)

### Community 9 - "Tenants CRUD"
Cohesion: 0.31
Nodes (6): Route, createTenantSchema, updateTenantSchema, createTenant, getTenants, updateTenant

### Community 10 - "Drizzle Demo Page"
Cohesion: 0.25
Nodes (6): Database Instance, Todos DB Schema, createTodo, getTodos, Route, Drizzle Demo Route

### Community 11 - "Date & Money Processing"
Cohesion: 0.48
Nodes (7): getCurrentDateTimeInKathmandu, getTodayInKathmandu, isPastDateInKathmandu, createManualInvoice, recalculateInvoiceStatus, nprToPaisa, recordCashPayment

### Community 12 - "Header Auth Components"
Cohesion: 0.33
Nodes (7): authClient, getAuth, Header, LandlordHeader, ThemeToggle, BetterAuthHeader, cn

### Community 13 - "Build Phases Plan"
Cohesion: 0.29
Nodes (7): Phase 0: Project Setup, Phase 1: Core Records + Manual Billing, Phase 2: Automation, Phase 3: Bank Transfer + Verification, Phase 4: Online Wallet Payments, Phase 5: Hardening + Extras, Phase 6: Multi-Landlord Readiness

### Community 14 - "Landlord Registration & Auth"
Cohesion: 0.83
Nodes (4): checkLandlordAuth Server Function, registerLandlord Server Function, getAuth, getDB

## Knowledge Gaps
- **94 isolated node(s):** `config`, `config`, `Register`, `SignupRoute`, `LoginRoute` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Drizzle Demo Route` connect `Drizzle Demo Page` to `Auth & Utilities Layer`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Root Layout` connect `Auth & Utilities Layer` to `Drizzle Demo Page`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Domain Logic Layer (src/lib)` (e.g. with `Integer Paisa Money Rule` and `Derived Invoice Status Rule`) actually correct?**
  _`Domain Logic Layer (src/lib)` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `config`, `Register` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & Authenticated Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `UI Components & Theme` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Server Functions & Domain Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._