# Ghar Bhanda — System & Flow Design Plan

> घर भाडा — Automated Rent Collection & E-Billing Platform for Nepal

---

## Context

Ghar Bhanda is a zero-to-low-cost automated rent collection and e-billing SaaS platform targeting Nepal's
informal rental market. The goal is to digitize rent collection, automate invoice generation, enforce tax
compliance (TDS / house-rent tax), and provide a unified web + mobile experience for landlords and tenants.

---

## 1. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | TanStack Start (React, SSR, Server Functions) | Full-stack, Vite-native, no vendor lock-in |
| Deployment | Cloudflare Workers via `@cloudflare/vite-plugin` | Edge, generous free tier, built-in Cron |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM | Type-safe SQL, free tier, CF-native |
| File Storage | Cloudflare R2 | Zero egress fees, S3-compatible |
| Auth | Better Auth (self-hosted) | Works on CF Workers edge runtime |
| PDF Generation | Cloudflare Browser Rendering API | Native CF feature, free 10 min/day |
| Mobile | Capacitor wrapping the web build | Single codebase → iOS + Android |
| Email | Resend | Free tier, excellent DX |
| SMS | Sparrow SMS | Nepal-specific SMS gateway |
| Payments | Khalti + eSewa + ConnectIPS | Nepal's dominant payment rails |

---

## 2. Repository Structure

```
ghar-bhanda/
├── app/
│   ├── routes/
│   │   ├── _app/                          # Authenticated layout (landlord)
│   │   │   ├── dashboard/
│   │   │   │   └── index.tsx              # Portfolio overview
│   │   │   ├── properties/
│   │   │   │   ├── index.tsx              # Property list
│   │   │   │   ├── new.tsx                # Add property
│   │   │   │   └── $propertyId.tsx        # Property detail / edit
│   │   │   ├── tenants/
│   │   │   │   ├── index.tsx              # Tenant list
│   │   │   │   ├── invite.tsx             # Send invite link
│   │   │   │   └── $tenantId.tsx          # Tenant detail
│   │   │   ├── leases/
│   │   │   │   ├── index.tsx              # Lease list
│   │   │   │   ├── new.tsx                # Create lease
│   │   │   │   └── $leaseId.tsx           # Lease detail / activate
│   │   │   ├── invoices/
│   │   │   │   ├── index.tsx              # Invoice list (all tenants)
│   │   │   │   └── $invoiceId.tsx         # Invoice detail
│   │   │   └── settings/
│   │   │       └── index.tsx              # PAN, bank, tax config
│   │   │
│   │   ├── tenant-portal/                 # Tenant-facing routes
│   │   │   ├── index.tsx                  # Tenant home
│   │   │   ├── invoices/
│   │   │   │   ├── index.tsx              # Invoice list (own only)
│   │   │   │   ├── $invoiceId.tsx         # Invoice detail + Pay Now
│   │   │   │   └── khalti-callback.tsx    # Khalti redirect handler
│   │   │   └── receipts/
│   │   │       └── $invoiceId.tsx         # Download receipt PDF
│   │   │
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── invite.$token.tsx          # Tenant invite registration
│   │   │
│   │   └── api/
│   │       ├── payments/
│   │       │   ├── khalti/
│   │       │   │   ├── initiate.ts        # Create Khalti order (server-only)
│   │       │   │   └── verify.ts          # Verify Khalti payment (server-only)
│   │       │   ├── esewa/
│   │       │   │   ├── initiate.ts        # HMAC-SHA256 sign (server-only)
│   │       │   │   └── verify.ts          # Verify eSewa response (server-only)
│   │       │   └── connectips/
│   │       │       ├── initiate.ts
│   │       │       └── callback.ts
│   │       ├── invoices/
│   │       │   └── generate-pdf.ts        # Browser Rendering → R2
│   │       └── webhooks/
│   │           └── payment-callback.ts    # Generic webhook receiver
│   │
│   ├── components/
│   │   ├── ui/                            # Buttons, inputs, tables, badges
│   │   ├── invoice/
│   │   │   └── InvoiceCard.tsx
│   │   └── payment/
│   │       └── PaymentModal.tsx           # Khalti / eSewa / ConnectIPS tabs
│   │
│   └── lib/
│       ├── db/
│       │   ├── schema.ts                  # All Drizzle table definitions
│       │   └── index.ts                   # D1 client factory
│       ├── auth/
│       │   └── index.ts                   # Better Auth config
│       ├── r2/
│       │   └── index.ts                   # Upload / signed-URL helpers
│       ├── pdf/
│       │   └── invoice-template.ts        # HTML → PDF template
│       ├── email/
│       │   └── index.ts                   # Resend wrappers
│       └── sms/
│           └── index.ts                   # Sparrow SMS wrappers
│
├── workers/
│   └── cron.ts                            # Cloudflare Cron Trigger handler
│
├── migrations/                            # Drizzle-generated SQL migrations
├── capacitor.config.ts                    # Mobile build config
├── wrangler.toml                          # CF bindings: D1, R2, Browser, Cron
├── drizzle.config.ts
├── vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 3. Database Schema

All monetary values stored in **paisa** (integer) to avoid floating-point errors.
NPR 10,000 = `1000000` paisa.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| email | text UNIQUE | |
| phone | text | Required for SMS |
| full_name | text | |
| citizenship_no | text | Nepal KYC requirement |
| pan_number | text | Tax ID |
| role | text | `landlord` \| `tenant` \| `admin` |
| is_verified | integer | 0/1 |
| consent_given_at | integer | Unix timestamp — Privacy Act |
| created_at | integer | Unix timestamp |

### `properties`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| landlord_id | text FK→users | |
| name | text | Friendly name |
| address | text | Full street address |
| ward_no | text | Ward number |
| plot_number | text | Cadastral plot — legal requirement |
| city | text | |
| district | text | |
| created_at | integer | |

### `tenants`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| user_id | text FK→users | Linked user account |
| landlord_id | text FK→users | Which landlord manages this tenant |
| is_corporate | integer | 0/1 — **drives TDS logic** |
| company_name | text | If corporate |
| company_pan | text | If corporate — required for TDS |
| created_at | integer | |

### `leases`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| property_id | text FK→properties | |
| tenant_id | text FK→tenants | |
| monthly_rent | integer | In paisa |
| start_date | text | ISO date |
| end_date | text | ISO date |
| billing_day | integer | 1–28, day of month for auto-invoicing |
| status | text | `active` \| `expired` \| `terminated` |
| agreement_r2_key | text | R2 path to signed lease PDF |
| created_at | integer | |

> Lease activation is blocked until `agreement_r2_key` is set (Civil Code §386 compliance).

### `invoices`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| lease_id | text FK→leases | |
| invoice_number | text UNIQUE | e.g. `GB-2081-001` |
| billing_period | text | e.g. `Chaitra 2081` |
| amount_base | integer | Monthly rent in paisa |
| tds_deducted | integer | 10% if corporate, else 0 |
| amount_payable | integer | `amount_base - tds_deducted` |
| status | text | `pending` \| `paid` \| `overdue` \| `cancelled` |
| due_date | text | ISO date |
| paid_at | integer | Unix timestamp |
| pdf_r2_key | text | R2 path to generated invoice PDF |
| created_at | integer | |

### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| invoice_id | text FK→invoices | |
| gateway | text | `khalti` \| `esewa` \| `connectips` \| `cash` |
| gateway_txn_id | text | Gateway's own transaction reference |
| amount | integer | In paisa |
| status | text | `initiated` \| `success` \| `failed` \| `refunded` |
| raw_response | text | Full JSON blob from gateway |
| created_at | integer | |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| user_id | text FK→users | |
| type | text | `invoice_generated` \| `payment_received` \| `overdue_reminder` \| `eviction_notice` |
| channel | text | `email` \| `sms` \| `in_app` |
| status | text | `sent` \| `failed` |
| created_at | integer | |

### `eviction_notices`
| Column | Type | Notes |
|---|---|---|
| id | text PK | ULID |
| lease_id | text FK→leases | |
| issued_at | text | ISO date |
| effective_date | text | `issued_at + 35 days` — Civil Code minimum |
| reason | text | |
| document_r2_key | text | R2 path to PDF notice |

---

## 4. Application Flows

### 4.1 Landlord Onboarding

```
Register (email + password)
  → Email verification
  → Profile setup: full name, PAN, citizenship number, phone
  → Add Property: address, ward, plot number, district
  → Add Tenant: name, phone, KYC fields, corporate flag
  → Create Lease: property, tenant, rent amount, billing day, start/end dates
  → Upload signed lease agreement PDF → R2
  → Activate Lease (blocked until PDF uploaded)
  → Billing cycle begins on next billing_day
```

### 4.2 Tenant Onboarding

```
Landlord clicks "Invite Tenant" → system generates signed invite URL
  → Tenant receives email with invite link
  → Tenant registers: name, phone, citizenship number
  → Tenant account linked to lease
  → Tenant accesses portal: can view invoices, make payments, download receipts
```

### 4.3 Automated Monthly Billing (Cron)

```
Cloudflare Cron fires daily at 00:00 Nepal time (18:15 UTC prev day)
  │
  ├─ Query: SELECT leases WHERE status='active' AND billing_day = day_of_month(today)
  │
  ├─ For each matching lease:
  │   │
  │   ├─ Compute amounts:
  │   │     base        = lease.monthly_rent
  │   │     tds         = tenant.is_corporate ? floor(base * 0.10) : 0
  │   │     payable     = base - tds
  │   │
  │   ├─ INSERT invoice { status: 'pending', due_date: today + 7 days }
  │   │
  │   ├─ Fetch full invoice + tenant + landlord + property data
  │   │
  │   ├─ Build HTML using invoice template
  │   │
  │   ├─ POST HTML → Cloudflare Browser Rendering API → PDF binary
  │   │
  │   ├─ PUT pdf_binary → R2: invoices/{lease_id}/{invoice_id}.pdf
  │   │
  │   ├─ UPDATE invoice.pdf_r2_key
  │   │
  │   ├─ Resend email to tenant: "Invoice ready for {billing_period}"
  │   │     Body: amount due, due date, "Pay Now" button → tenant portal
  │   │
  │   └─ Sparrow SMS to tenant: "Rent invoice NPR X,XXX due {date}. Pay: <link>"
  │
  └─ Mark overdue: UPDATE invoices SET status='overdue'
       WHERE status='pending' AND due_date < today
```

### 4.4 Khalti Payment Flow

```
Tenant opens invoice → clicks "Pay with Khalti"
  │
  ├─ [Server Function] POST /api/payments/khalti/initiate
  │     Validate: invoice belongs to session tenant, status = 'pending'
  │     Generate: purchase_order_id = `${invoice.id}-${Date.now()}`
  │     POST to Khalti /api/v2/epayment/initiate/
  │       Headers: { Authorization: "Key {KHALTI_SECRET_KEY}" }
  │       Body: { return_url, website_url, amount, purchase_order_id, ... }
  │     Return: { payment_url }
  │
  ├─ Client: window.location.href = payment_url
  │
  ├─ Tenant completes payment on Khalti
  │
  ├─ Khalti redirects to /tenant-portal/invoices/khalti-callback?pidx=...&status=Completed
  │
  └─ [Server Function] POST /api/payments/khalti/verify
        POST to Khalti /api/v2/epayment/lookup/
          Body: { pidx }
        Assert: response.status === 'Completed'
        Assert: response.total_amount === invoice.amount_payable
        INSERT transaction { status: 'success', gateway_txn_id: pidx, raw_response }
        UPDATE invoice { status: 'paid', paid_at: now() }
        Send receipt email to tenant + landlord
        Send SMS confirmation
```

### 4.5 eSewa Payment Flow

```
Tenant clicks "Pay with eSewa"
  │
  ├─ [Server Function] POST /api/payments/esewa/initiate
  │     Generate: transaction_uuid = ulid()
  │     Compute HMAC:
  │       message = `total_amount=${amount},transaction_uuid=${uuid},product_code=${PRODUCT_CODE}`
  │       signature = Base64(HmacSHA256(message, ESEWA_SECRET_KEY))
  │     Store: { transaction_uuid → invoice_id } in D1 (pending lookup)
  │     Return: { amount, transaction_uuid, product_code, signature, esewa_form_url }
  │
  ├─ Client: auto-submit hidden POST form to eSewa endpoint
  │
  ├─ Tenant completes payment on eSewa
  │
  ├─ eSewa redirects to /api/payments/esewa/verify?data=<base64_encoded_response>
  │
  └─ [Server Function] GET /api/payments/esewa/verify
        Decode base64 → JSON { transaction_uuid, status, total_amount, ... }
        Re-compute expected HMAC from response fields
        Assert: computed_signature === response.signature  (tamper check)
        Assert: status === 'COMPLETE'
        Look up invoice_id via transaction_uuid
        INSERT transaction + UPDATE invoice → paid
        Notify tenant + landlord
```

### 4.6 Overdue Reminders & Eviction Flow

```
Cron daily check (same worker as billing):
  │
  ├─ Invoices overdue 7+ days:
  │     Send reminder email + SMS to tenant
  │     Log notification record
  │
  ├─ Invoices overdue 30+ days:
  │     Flag on landlord dashboard: "Action required"
  │     Landlord can click: "Issue Eviction Notice"
  │
  └─ Eviction Notice flow:
        INSERT eviction_notices {
          issued_at:    today,
          effective_date: today + 35 days   ← Civil Code §386 minimum, enforced server-side
        }
        Build HTML notice template → Browser Rendering API → PDF
        PUT PDF → R2: evictions/{lease_id}/{notice_id}.pdf
        Send PDF via email to tenant
        UPDATE lease.status → 'terminated' on effective_date (second cron check)
```

### 4.7 PDF Invoice Generation (Detail)

```
Worker receives: invoice_id
  │
  ├─ JOIN query: invoice + lease + tenant + property + landlord (from D1)
  │
  ├─ Build HTML string:
  │     ┌─────────────────────────────────────────────────┐
  │     │  [Logo]         TAX INVOICE / RENT RECEIPT      │
  │     │  Invoice No: GB-2081-001   Date: 2025-04-01    │
  │     ├──────────────────┬──────────────────────────────┤
  │     │  FROM (Landlord) │  TO (Tenant)                 │
  │     │  Name, PAN       │  Name, Citizenship No        │
  │     │                  │  Company PAN (if corporate)  │
  │     ├──────────────────┴──────────────────────────────┤
  │     │  Property: [address], Ward [X], Plot [Y]        │
  │     │  Billing Period: Chaitra 2081                   │
  │     ├─────────────────────────────┬───────────────────┤
  │     │  Description                │  Amount (NPR)     │
  │     │  Monthly Rent               │  XX,XXX           │
  │     │  TDS Deduction (10%)        │ -X,XXX  ← corporate only
  │     │  Amount Payable             │  XX,XXX           │
  │     ├─────────────────────────────┴───────────────────┤
  │     │  [QR Code → tenant portal]  Due: 2025-04-08    │
  │     └─────────────────────────────────────────────────┘
  │
  ├─ POST HTML → Cloudflare Browser Rendering API (Puppeteer/headless Chrome)
  │
  └─ Write PDF binary → R2
```

---

## 5. Role-Based Access Control

| Route Prefix | Allowed Roles | Enforcement |
|---|---|---|
| `/dashboard/*` | `landlord` | `beforeLoad` session check |
| `/properties/*` | `landlord` | `beforeLoad` session check |
| `/tenants/*` | `landlord` | `beforeLoad` session check |
| `/leases/*` | `landlord` | `beforeLoad` session check |
| `/settings/*` | `landlord` | `beforeLoad` session check |
| `/tenant-portal/*` | `tenant` | `beforeLoad` + row-level check |
| `/api/payments/*` | `tenant` | Invoice ownership validated server-side |
| `/api/invoices/*` | `landlord` | Session + landlord ownership check |
| `/admin/*` | `admin` | `beforeLoad` role check |

Row-level security: tenants can only access invoices where `invoice.lease.tenant.user_id = session.userId`.

---

## 6. Compliance Implementation

### Tax Logic
```typescript
// app/workers/cron.ts — invoice creation
const isCorporate = tenant.is_corporate === 1;
const base    = lease.monthly_rent;            // paisa
const tds     = isCorporate ? Math.floor(base * 0.10) : 0;
const payable = base - tds;

// PDF template conditionally renders TDS line
```

**Individual tenants**: landlord pays 10% to local municipality directly (manual, outside app).
**Corporate tenants**: 10% TDS shown as deduction on invoice; tenant deposits to IRD; landlord receives 90%.

### Lease Agreement Enforcement
- Lease `activate` action: blocked if `agreement_r2_key IS NULL`
- Applies to all leases (Civil Code §386 requires written contract)

### Privacy Act 2075 Compliance
- `consent_given_at` timestamp recorded at registration
- Purpose stated in Terms of Service: "5-year statutory financial retention"
- R2 lifecycle rule: auto-delete documents after **1,825 days** (5 years)
- `/api/user/export` endpoint: returns all personal data as JSON download

### Eviction Notice (Civil Code §386)
- `effective_date = issued_at + 35` days — minimum notice period
- Server rejects any `effective_date` less than `issued_at + 35` days
- Cannot terminate lease before `effective_date`

---

## 7. Cloudflare Configuration (`wrangler.toml`)

```toml
name = "ghar-bhanda"
main = "app/workers/cron.ts"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding = "DB"
database_name = "ghar-bhanda-prod"
database_id   = "<to-be-filled-after-cf-create>"

[[r2_buckets]]
binding    = "DOCUMENTS"
bucket_name = "ghar-bhanda-documents"

[[browser]]
binding = "BROWSER"

[triggers]
crons = ["15 18 * * *"]   # 00:00 NST (Nepal Standard Time = UTC+5:45)

[vars]
APP_URL     = "https://gharbhanda.com"
ENVIRONMENT = "production"

# Secrets — set via: wrangler secret put <KEY>
# KHALTI_SECRET_KEY
# ESEWA_SECRET_KEY
# ESEWA_PRODUCT_CODE
# CONNECTIPS_CERT_PEM
# RESEND_API_KEY
# SPARROW_SMS_TOKEN
# BETTER_AUTH_SECRET
```

---

## 8. Implementation Phases

### Phase 1 — Project Scaffold
- [ ] `npm create cloudflare@latest` with TanStack Start template
- [ ] Configure `wrangler.toml` (D1, R2, Browser binding, Cron)
- [ ] Write `app/lib/db/schema.ts` — all 7 tables with Drizzle
- [ ] Run `drizzle-kit generate` + `wrangler d1 migrations apply`
- [ ] Configure Better Auth (`app/lib/auth/index.ts`)
- [ ] Auth routes: login, register, email verification

### Phase 2 — Landlord Dashboard (Core CRUD)
- [ ] Authenticated route layout with session guard
- [ ] Properties: list, create, edit
- [ ] Tenants: list, invite flow, corporate flag, KYC fields
- [ ] Leases: create, PDF upload to R2, activate (with agreement guard)
- [ ] Invoices: list with status badges, manual invoice create

### Phase 3 — Tenant Portal
- [ ] Invite-based tenant registration (`/auth/invite.$token`)
- [ ] Tenant invoice list (row-level filtered)
- [ ] Invoice detail page: amounts, TDS breakdown, due date
- [ ] PDF download via signed R2 URL (15-min expiry)
- [ ] Payment modal with Khalti / eSewa / ConnectIPS tabs

### Phase 4 — Payment Integration
- [ ] Khalti: `initiate.ts` + `verify.ts` Server Functions
- [ ] eSewa: HMAC-SHA256 signing + response verification
- [ ] ConnectIPS: NPI API + `.pfx` → `.pem` certificate handling
- [ ] Transaction record creation + invoice status update on success
- [ ] Receipt generation post-payment

### Phase 5 — Automated Billing Cron
- [ ] `workers/cron.ts`: query active leases → generate invoices
- [ ] HTML invoice template (`app/lib/pdf/invoice-template.ts`)
- [ ] Browser Rendering API integration → PDF → R2
- [ ] Resend email dispatch with invoice link
- [ ] Sparrow SMS dispatch
- [ ] Overdue detection + reminder escalation logic

### Phase 6 — Eviction & Compliance
- [ ] Eviction notice PDF generation (35-day rule server-enforced)
- [ ] TDS conditional rendering on corporate invoices
- [ ] Privacy consent logging at registration
- [ ] R2 lifecycle policy (5-year auto-delete)
- [ ] `/api/user/export` data export endpoint

### Phase 7 — Mobile (Capacitor)
- [ ] `npx cap init` + `capacitor.config.ts`
- [ ] `@capacitor/push-notifications` for FCM notifications
- [ ] `npx cap add android` + `npx cap add ios`
- [ ] Test tenant portal on Android emulator
- [ ] Build signed APK + IPA for store submission

### Phase 8 — Hardening & Launch
- [ ] Swap all sandbox keys → production keys
- [ ] Cloudflare WAF rules: rate-limit `/api/payments/*` (10 req/min per IP)
- [ ] Sentry SDK for CF Workers error monitoring
- [ ] `wrangler deploy` to production
- [ ] Custom domain + SSL via Cloudflare DNS
- [ ] Load test: simulate 100 concurrent Cron invoice generations

---

## 9. Critical Files

| File | Purpose |
|---|---|
| `app/lib/db/schema.ts` | Single source of truth for all table definitions |
| `app/lib/auth/index.ts` | Better Auth config (sessions, email OTP) |
| `workers/cron.ts` | Monthly billing automation entry point |
| `app/routes/api/payments/khalti/initiate.ts` | Khalti order creation (secret key server-only) |
| `app/routes/api/payments/khalti/verify.ts` | Khalti payment lookup + confirmation |
| `app/routes/api/payments/esewa/initiate.ts` | eSewa HMAC-SHA256 signing |
| `app/routes/api/payments/esewa/verify.ts` | eSewa response validation |
| `app/lib/pdf/invoice-template.ts` | HTML template → PDF via Browser Rendering |
| `app/routes/api/invoices/generate-pdf.ts` | Orchestrates template + Browser API + R2 |
| `wrangler.toml` | All Cloudflare bindings and Cron schedule |
| `drizzle.config.ts` | Migration config pointing to D1 |

---

## 10. Verification Checklist

- [ ] `drizzle-kit push` applies all migrations cleanly to local D1
- [ ] Better Auth login/logout/session works on CF Workers edge runtime
- [ ] Khalti sandbox: full cycle — initiate → redirect → verify → invoice `paid`
- [ ] eSewa: HMAC signature mismatch correctly rejected with 400
- [ ] Cron: `wrangler dev --test-scheduled` → invoices inserted in D1, PDFs in R2
- [ ] Corporate tenant invoice: TDS line present, `amount_payable = rent * 0.90`
- [ ] Individual tenant invoice: no TDS line, `amount_payable = rent`
- [ ] Eviction: `effective_date < issued_at + 35` rejected server-side with error
- [ ] R2 signed URL expires after 15 minutes (unauthorized access blocked)
- [ ] Capacitor Android build: tenant portal renders, payment flow completes
