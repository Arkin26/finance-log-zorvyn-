# Finance Dashboard

Razorpay-inspired finance analytics dashboard built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL + RLS)**.

Black/white/gray + blues are used exclusively for the UI. Errors use red, and success badges/toasts use green.

## Tech Stack (and Why)

- **Next.js 14 App Router + TypeScript**: scalable routing model, type-safe API contracts, and server-first rendering.
- **Supabase Postgres + RLS**: secure, row-level authorization enforced in the database layer.
- **Supabase Auth Helpers**: simplifies session cookie handling for route handlers and middleware.
- **TanStack Query (React Query)**: request deduplication, cache, and mutation workflows with optimistic updates.
- **Recharts**: lightweight charts for dashboard analytics.
- **TanStack Virtual**: row virtualization support for large tables (enabled when datasets exceed 100 rows).
- **Zod**: shared validation rules for API inputs and query parameters.

## Project Structure

- `app/(auth)/login/` — Login page
- `app/(dashboard)/layout.tsx` — Sidebar + topbar shell
- `app/(dashboard)/page.tsx` — Dashboard summary
- `app/(dashboard)/transactions/` — Transactions CRUD (CRUD + filters)
- `app/(dashboard)/users/` — Admin-only user management
- `app/(dashboard)/analytics/` — Charts and trends (read-only)
- `app/api/auth/` — login, logout, me
- `app/api/transactions/` — CRUD + filters
- `app/api/users/` — user management
- `app/api/dashboard/summary/` — summary aggregations
- `lib/supabase/` — Supabase client (server, browser, admin)
- `lib/auth/` — session + role helpers
- `lib/middleware/` — RBAC middleware factory (`withRole`)
- `lib/validators/` — Zod schemas
- `types/` — shared TypeScript types
- `middleware.ts` — edge middleware for route protection

## Setup

### 1) Environment Variables

Create `finance-dashboard/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2) Supabase SQL

In the Supabase SQL editor, run the SQL schema/policies you provided:

- enums: `user_role`, `user_status`, `transaction_type`
- tables: `public.profiles`, `public.transactions`
- triggers for `updated_at`
- RLS enablement + policies
- `public.transaction_summary` view

### 3) Seed Script

The seed script creates:
- `admin@demo.com` (password `Admin@1234`) with role `admin`
- `analyst@demo.com` (password `Analyst@1234`) with role `analyst`
- `viewer@demo.com` (password `Viewer@1234`) with role `viewer`
- 50 randomized transactions across the last 6 months

Run:

```bash
cd finance-dashboard
npm run seed
```

### 4) Dev Server

```bash
npm run dev
```

Open:
- `http://localhost:3000/login`
- then sign in and visit `/dashboard`

## Role Permission Matrix

| Role | Transactions Read | Transactions Create | Transactions Update | Transactions Delete | Users Management | Dashboard Summary |
|---|---|---|---|---|---|---|
| viewer | Yes | No | No | No | No | Yes |
| analyst | Yes | Yes | No | No | No | Yes |
| admin | Yes | Yes | Yes | Yes | Yes | Yes |

Additional security rules:
- Soft-deleted transactions (`deleted_at IS NOT NULL`) are excluded from all API reads and summaries.
- Inactive profiles are blocked by RBAC middleware.
- Admin updates enforce: cannot demote the last admin and cannot deactivate your own account.

## API Endpoint Reference

| Method | Endpoint | Auth / RBAC | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Email/password login |
| `POST` | `/api/auth/logout` | Auth required | Sign out |
| `GET` | `/api/auth/me` | Auth required | Current user + profile (role/status) |
| `GET` | `/api/transactions` | `viewer+` | Filters, sorting, pagination |
| `POST` | `/api/transactions` | `analyst+` | Create transaction |
| `GET` | `/api/transactions/:id` | `viewer+` | Get a single transaction |
| `PATCH` | `/api/transactions/:id` | `admin+` | Partial update (Zod validated) |
| `DELETE` | `/api/transactions/:id` | `admin+` | Soft-delete (`deleted_at = now()`) |
| `GET` | `/api/users` | `admin` | List all profiles |
| `POST` | `/api/users` | `admin` | Create a user (service role + profiles insert) |
| `PATCH` | `/api/users/:id` | `admin` | Update role/status with guardrails |
| `GET` | `/api/dashboard/summary` | `viewer+` | Summary aggregations for charts/tables |

### Transactions Query Params (GET `/api/transactions`)

- `type` (`income` | `expense`)
- `category`
- `date_from` (`YYYY-MM-DD`)
- `date_to` (`YYYY-MM-DD`)
- `page` (default `1`, coerced to int)
- `limit` (default `20`, capped at `100`)
- `sort_by` (`date` | `amount`, default `date`)
- `order` (`asc` | `desc`, default `desc`)

If `date_from > date_to`, the API returns `422`.

## Assumptions

- Single-tenant app (no organizations/tenants).
- Category filtering is treated as exact match for performance (indexed columns).
- Dashboard summary uses the `public.transaction_summary` view for aggregations.
- The `fd-role` cookie exists only for client-side UI gating; authorization is enforced by API RBAC + Postgres RLS.

## Future Work (More Time)

- Rate limiting (per IP and per user) for auth and write APIs.
- Audit logs for admin actions (role/status changes, transaction updates/deletes).
- Automated test suite:
  - API unit tests for validators and route guard logic
  - integration tests against Supabase (RLS + policies)
  - UI tests for critical flows (login, mutations, pagination)
- Better chart customization (time-window selection, persistent user preferences).

