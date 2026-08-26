# Automated Room Rent Collection System — Requirements

> **Companion to `plan.md`.** This document defines _what_ the system must do and the
> qualities it must have. `plan.md` defines _how_ it is built. Every requirement here
> has a stable ID so phases, code, and tests can trace back to it. Requirements are
> written to be **verifiable** — each one should be answerable yes/no by a test or a
> demonstration.

---

## 1. Purpose & scope

The system automates the monthly cycle of billing tenants for room rent and collecting
payment, replacing manual tracking (spreadsheets, paper, memory) for a landlord renting
individual rooms or units.

**MVP scope:** a single landlord managing multiple properties, rooms, tenants, and
leases.

**Future scope (must not be blocked by the design):** multiple independent landlords,
native mobile apps.

---

## 2. Actors

| Actor               | Description                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| **Landlord**        | Owner/admin. Manages rooms, tenants, and leases; reviews and verifies payments; views the dashboard.    |
| **Tenant**          | Renter. Views their invoices and payment history; pays online or submits bank-transfer proof.           |
| **System**          | Automated processes. Generates invoices, sends reminders, and reconciles payments without human action. |
| **Payment gateway** | External Khalti / eSewa services that process wallet payments and call back via webhook.                |

---

## 3. Functional requirements

### 3.1 Accounts & authentication

- **FR-1** A landlord can create an account and sign in securely.
- **FR-2** A tenant can sign in to a portal limited to their own data.
- **FR-3** A user session expires and can be ended by signing out.
- **FR-4** Every data operation is scoped to the authenticated user; a landlord can
  access only their own records, and a tenant only their own invoices and payments.
- **FR-5** Authenticated server operations are protected at the operation level, not
  only at the page level.

### 3.2 Property, room, tenant & lease management

- **FR-6** A landlord can create, view, edit, and deactivate **properties**.
- **FR-7** A landlord can create, view, edit, and deactivate **rooms**, each belonging
  to a property.
- **FR-8** A landlord can create, view, and edit **tenant** records (name, email,
  phone).
- **FR-9** A landlord can create a **lease** linking one tenant to one room, recording
  rent amount, deposit, billing day of month, start date, and optional end date.
- **FR-10** A landlord can end a lease; an ended lease stops generating new invoices.
- **FR-11** The billing day is restricted to the 1st–28th so it exists in every month.

### 3.3 Invoice generation & billing

- **FR-12** The system automatically generates one invoice per active lease each month
  on that lease's billing day, with no landlord action required.
- **FR-13** An invoice is itemized into line items (rent, plus optional recurring
  utilities such as electricity or water).
- **FR-14** Invoice generation is idempotent: re-running it never creates a duplicate
  invoice for the same lease and billing period.
- **FR-15** A landlord can additionally create a manual/ad-hoc invoice.
- **FR-16** Each invoice has a status of `unpaid`, `partial`, `paid`, or `overdue`,
  derived automatically from its confirmed payments and due date — never set manually.
- **FR-17** An invoice not fully paid by its due date is reflected as `overdue`.

### 3.4 Payments — online wallets

- **FR-18** A tenant can pay an invoice online via Khalti or eSewa.
- **FR-19** On a completed wallet payment, the system records the payment and updates
  the invoice status automatically.
- **FR-20** The system verifies each wallet payment server-side (signature and amount)
  before treating it as confirmed.
- **FR-21** Duplicate or tampered payment callbacks are rejected.

### 3.5 Payments — bank transfer & verification

- **FR-22** A tenant can record a bank-transfer payment by submitting a reference
  number and uploading a proof screenshot.
- **FR-23** A bank-transfer payment is held in a `pending verification` state until the
  landlord acts on it.
- **FR-24** A landlord sees all pending bank transfers in a single verification queue.
- **FR-25** A landlord can approve or reject a pending payment; approval confirms it
  and updates the invoice, rejection notifies the tenant to resubmit.
- **FR-26** A landlord can also record a cash payment directly.

### 3.6 Payment integrity

- **FR-27** Payments are an append-only ledger: payment records are never edited or
  deleted; corrections are made by adding new records.
- **FR-28** An invoice may be settled by multiple payments (partial payments are
  supported); status reflects the sum of confirmed payments.

### 3.7 Notifications & reminders

- **FR-29** The system sends a payment reminder a configurable number of days before
  the due date.
- **FR-30** The system sends a reminder on the due date.
- **FR-31** The system sends an overdue reminder after the due date.
- **FR-32** Each reminder type is sent at most once per invoice.
- **FR-33** The system sends a receipt/confirmation when a payment is confirmed.
- **FR-34** All notifications are logged with channel, type, recipient, and outcome.
- **FR-35** Email is the MVP channel; SMS is supported as an added channel.

### 3.8 Landlord dashboard & reporting

- **FR-36** A landlord can see, at a glance, which invoices are paid, partial, unpaid,
  and overdue.
- **FR-37** A landlord can view a single invoice with its line items and payment
  history.
- **FR-38** A landlord can view total amount collected versus outstanding for a period.

### 3.9 Tenant portal

- **FR-39** A tenant can view their current and past invoices and each invoice's
  status.
- **FR-40** A tenant can view their payment history.
- **FR-41** A tenant can initiate payment or submit transfer proof from the portal.

---

## 4. Non-functional requirements

### 4.1 Performance

- **NFR-1** Pages and core interactions must feel fast for users located in Nepal;
  static content should be served from infrastructure with a presence in/near Nepal.
- **NFR-2** Common dashboard and portal views respond within ~1 second under normal
  load.

### 4.2 Availability & reliability

- **NFR-3** Scheduled jobs (invoicing, reminders) must be idempotent and safe to run
  more than once.
- **NFR-4** A failed external send (email/SMS/payment callback) must not corrupt
  invoice or payment state and must be retriable.
- **NFR-5** The system remains consistent regardless of which entry point (UI action,
  scheduled job, or webhook) changes payment state.

### 4.3 Security

- **NFR-6** Authentication credentials and API secrets are never exposed to the client
  or committed to source control.
- **NFR-7** All payment webhooks are authenticated and amount-verified before any state
  change.
- **NFR-8** Every record is access-scoped to its owner; no user can read or modify
  another user's data.
- **NFR-9** Uploaded proof images are stored privately and served only to authorized
  users.

### 4.4 Cost

- **NFR-10** The MVP must be operable on free-tier infrastructure; the only unavoidable
  recurring costs are optional SMS and, later, app-store fees.

### 4.5 Localization

- **NFR-11** All monetary values are in Nepalese Rupees (NPR) and stored as integer
  minor units (paisa) — never as floating-point numbers.
- **NFR-12** All date and billing logic operates in Nepal Time (`Asia/Kathmandu`,
  UTC+05:45).
- **NFR-13** The interface should accommodate adding Nepali-language support later.

### 4.6 Scalability & extensibility

- **NFR-14** The data model includes a landlord ownership key on every owned record so
  that supporting multiple independent landlords is an additive change, not a rewrite.
- **NFR-15** The data/API layer must be reusable by a future native mobile client
  without redesign.

### 4.7 Usability & accessibility

- **NFR-16** The web app is responsive and usable on mobile browsers.
- **NFR-17** The web app is installable as a PWA so it behaves like an app without an
  app-store release.
- **NFR-18** The UI follows basic accessibility practices (labels, contrast, keyboard
  navigation).

### 4.8 Maintainability

- **NFR-19** Business logic that mutates invoice or payment state is centralized in one
  layer, not duplicated across UI, scheduled, and webhook code paths.
- **NFR-20** The codebase is fully typed (TypeScript strict mode).

### 4.9 Data management

- **NFR-21** Production data is backed up on a regular automated schedule.
- **NFR-22** All payment and notification activity is auditable via a persistent log.

---

## 5. Constraints & assumptions

- **C-1** Tenants and landlords have internet access and a smartphone or computer.
- **C-2** Online payment requires approved Khalti and eSewa merchant accounts;
  obtaining these is a prerequisite and can take time.
- **C-3** SMS delivery incurs a per-message cost; email does not.
- **C-4** Each tenant has at least an email address; phone number is optional but
  recommended.
- **C-5** MVP supports a single landlord; multi-landlord operation is a planned later
  phase.
- **C-6** Bank-transfer verification is a manual landlord action — the system cannot
  auto-confirm transfers without bank API access.

---

## 6. Out of scope (MVP)

- Accounting, tax, or general-ledger exports.
- Maintenance/complaint ticketing.
- Multi-currency support.
- Native iOS/Android apps (a PWA covers the mobile experience initially).
- Automated reconciliation of bank transfers via banking APIs.

---

## 7. Acceptance criteria (MVP is "done" when)

- **AC-1** A landlord can model real properties, rooms, tenants, and leases.
- **AC-2** Monthly invoices are generated automatically with zero manual effort, and
  re-running generation never duplicates them.
- **AC-3** Reminder emails are sent before, on, and after the due date, once each.
- **AC-4** A tenant can pay an invoice via Khalti or eSewa and the invoice updates
  automatically after verification.
- **AC-5** A tenant can submit a bank transfer with proof, the landlord can verify it
  from the queue, and the invoice updates on approval.
- **AC-6** Partial payments are handled and reflected accurately in invoice status.
- **AC-7** The landlord dashboard accurately shows paid / partial / unpaid / overdue at
  a glance.
- **AC-8** Tampered or duplicate payment callbacks are rejected.
- **AC-9** The system runs on free-tier infrastructure.

---

## 8. Glossary

| Term                   | Meaning                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **Lease**              | An agreement linking one tenant to one room, with rent, deposit, and a monthly billing day. |
| **Invoice**            | A monthly bill for one lease and one billing period.                                        |
| **Line item**          | A single charge on an invoice (rent, a utility, an adjustment).                             |
| **Payment**            | A record of money received (or attempted) against an invoice.                               |
| **Verification queue** | The set of bank-transfer payments awaiting landlord approval.                               |
| **Derived status**     | Invoice status computed from confirmed payments, never set by hand.                         |
| **Paisa**              | Minor unit of the Nepalese Rupee; 100 paisa = 1 NPR. Money is stored in paisa.              |
| **NPT**                | Nepal Time, UTC+05:45.                                                                      |
| **PWA**                | Progressive Web App — a website installable like a native app.                              |
