# ghar-bhandaa (घर भाडा)

> **Automated Room Rent Collection & Property Management System for Nepal**  
> Built with TanStack Start (React 19), Cloudflare Workers, Cloudflare D1 (SQLite via Drizzle ORM), Better Auth, and Cloudflare R2.

---

## Overview

`ghar-bhandaa` is a modern, serverless property management and automated rent collection system designed specifically for landlords operating residential or commercial multi-room, multi-property leases in Nepal.

The platform streamlines tenant onboarding, lease agreements, monthly itemized invoice generation, payment tracking (cash, bank transfer receipts, and digital wallets), and overdue payment workflows with strict domain invariant guarantees.

---

## Core Domain Invariants

1. **Nepal / Kathmandu Timezone (`Asia/Kathmandu`, UTC+05:45)**: All billing dates, due dates, and overdue transitions are calculated relative to Nepal's non-standard +05:45 offset using centralized date helpers (`src/lib/dates.ts`).
2. **Integer Paisa Currency Arithmetic**: Monetary values in the database are stored exclusively as integer minor units ($1\text{ NPR} = 100\text{ Paisa}$) to eliminate floating-point rounding errors.
3. **Append-Only Payment Ledger**: The `payments` table functions as an immutable financial ledger. Payments cannot be edited or deleted once recorded, and cash overpayments are strictly rejected.
4. **Derived Invoice Status Machine**: Invoices transition deterministically through `unpaid`, `partial`, `overdue`, and `paid` based on confirmed payments and Kathmandu due dates.
5. **Multi-Tenant Data Isolation**: Function-level middleware (`landlordAuthMiddleware`) and relational ownership checks ensure strict tenant data segregation across all server functions.
6. **Idempotent Invoice Generation**: Composite unique constraints `(lease_id, period)` guarantee that automated monthly billing runs never create duplicate invoices for a given lease period.

---

## Technology Stack

- **Framework**: [TanStack Start v1](https://tanstack.com/start) (Full-stack SSR with React 19)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Type-safe file-based routing)
- **Edge Compute**: [Cloudflare Workers](https://workers.cloudflare.com/) (Low-latency edge hosting with Kathmandu PoP)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless distributed SQLite)
- **ORM & Migrations**: [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm/d1`) & Drizzle Kit (`drizzle-kit`)
- **Authentication**: [Better Auth](https://www.better-auth.com/) with Drizzle SQLite adapter and TanStack Start cookie plugins
- **Object Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (Private bucket for bank transfer payment receipts)
- **Validation**: [Zod](https://zod.dev/) (Runtime schema validation for forms & RPC calls)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) with comprehensive invariant & unit test suites

---

## Documentation Suite

Detailed technical documentation is available in the [`docs/`](docs/) directory:

- 📐 **[Architecture & Domain Guide](docs/architecture.md)** — High-level architecture, three entry points model, complete 13-table Mermaid ERD, sequence diagrams, and 10 domain invariants.
- 📚 **[API & Server Functions Catalog](docs/api-catalog.md)** — Complete catalog of all 16 server functions, input Zod schemas, return structures, authorization requirements, and Better Auth REST endpoints.
- 🛠️ **[Developer & Operations Guide](docs/developer-guide.md)** — Local development setup, Cloudflare D1 migrations, testing workflows, deployment instructions, and scheduled cron operations.
- 🛡️ **[Consolidated Audit Report](docs/audit-report.md)** — Detailed review of the 11 audited findings (IDOR, accounting balance aggregation, cash overpayments, overdue precedence), severities, remediations, and test proofs.

---

## Getting Started

### Prerequisites

- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 10.0.0`
- **Cloudflare Wrangler CLI**: `npm i -g wrangler` or via `pnpm dlx wrangler`

### 1. Installation

```bash
git clone https://github.com/KosalRaj/ghar-bhandaa.git
cd ghar-bhandaa
pnpm install
```

### 2. Configure Environment Variables

Create a `.dev.vars` file for local development:

```ini
BETTER_AUTH_SECRET="your-32-char-random-secret"
APP_BASE_URL="http://localhost:3000"
```

To generate a secure secret:

```bash
pnpm dlx @better-auth/cli secret
```

### 3. Initialize Local Database

Generate SQL migration files and apply them to your local Miniflare D1 SQLite database:

```bash
pnpm run db:generate
pnpm run db:migrate
```

### 4. Start Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Migrations Workflow

| Command                          | Description                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| `pnpm run db:generate`           | Generates new SQL migration files from schema in `src/db/schema.ts`    |
| `pnpm run db:migrate`            | Applies pending migrations to local Cloudflare D1 SQLite database      |
| `pnpm run db:migrate:production` | Applies pending migrations to remote production Cloudflare D1 database |

---

## Testing & Quality Checks

Run the automated test suite, typechecker, and linters:

```bash
# Run unit & domain invariant test suite (Vitest)
pnpm test

# Typecheck source code with TypeScript
pnpm run typecheck

# Lint source code with ESLint
pnpm run lint

# Check code formatting with Prettier
pnpm run check

# Automatically format and fix lint issues
pnpm run format
```

---

## Deployment to Cloudflare Workers

1. **Log in to Cloudflare**:

   ```bash
   npx wrangler login
   ```

2. **Create Remote Resources (if first time)**:

   ```bash
   npx wrangler d1 create ghar-bhandaa-db
   npx wrangler r2 bucket create ghar-bhandaa-proofs
   npx wrangler secret put BETTER_AUTH_SECRET
   ```

   _Note: Update the `database_id` in `wrangler.jsonc` with your created database ID._

3. **Deploy Application**:
   ```bash
   pnpm run deploy
   ```

### Scheduled Cron Triggers

Automated invoicing and overdue recalculation run daily at **01:00 UTC (06:45 Asia/Kathmandu)** via Cloudflare Cron Triggers configured in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": ["0 1 * * *"]
}
```

---

## Project Structure

```
ghar-bhandaa/
├── docs/                       # Comprehensive documentation suite
│   ├── api-catalog.md          # Server functions & HTTP endpoints reference
│   ├── architecture.md         # System architecture, ERD & domain invariants
│   ├── audit-report.md         # Consolidated code review & invariant audit
│   └── developer-guide.md      # Setup, migrations, testing & ops guide
├── drizzle/                    # SQL schema migration snapshots
├── src/
│   ├── components/             # React UI components & navigation headers
│   ├── db/                     # Drizzle ORM schema (13 tables) & D1 client factory
│   ├── integrations/           # Better Auth client & UI hooks
│   ├── lib/                    # Core domain services (money, dates, invoices, payments)
│   │   └── __tests__/          # Unit & invariant test suites
│   ├── middleware/             # Request & function-level auth middleware
│   ├── routes/                 # TanStack Router file-based route definitions
│   │   ├── _authed/            # Protected landlord dashboard & management routes
│   │   └── api/                # Better Auth & webhook HTTP endpoints
│   ├── schemas/                # Zod validation schemas
│   ├── server/                 # TanStack Start server functions (RPC layer)
│   └── types/                  # Cloudflare Worker environment bindings
├── drizzle.config.ts           # Drizzle Kit configuration
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite & Cloudflare SSR plugins
└── wrangler.jsonc              # Cloudflare Workers bindings & cron triggers
```

---

## License

Private & Proprietary. All rights reserved.
