# Brotherhood Community Portal — Architecture Overview

## 1. System Context & Overview
The **Brotherhood Community Portal** is a production-oriented management platform designed for a motorcycle touring community with 100–300 members. It delivers a public portal, digital membership with QR verification, event management, mobile QR attendance check-in, event-based invoicing with manual transfer verification, cash ledger accounting, private member forum, and role-based administrative dashboards.

## 2. Technology Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode).
- **Styling**: Tailwind CSS v4, custom Brotherhood touring design system (Charcoal `#171918`, Asphalt `#292B29`, Bone `#E9E2D3`, Muted Gold `#B39A68`).
- **Icons & UI Utilities**: Lucide React, class-variance-authority, clsx, tailwind-merge.
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS) on all tables.
- **Identity & Auth**: Supabase Auth (Email/Password, Session Tokens, Protected Middleware).
- **File Storage**: Supabase Storage (Public bucket for news/gallery, Private bucket with signed URLs for transfer proofs & sensitive IDs).
- **Validation**: Zod schema validation on client forms and server actions.
- **QR Engine**: Cryptographic token hashing with server-side validation.

## 3. Directory Structure
```
src/
  app/
    (public)/       # Landing page, /about, /committee, /events, /news, /gallery, /join
    (auth)/         # /login, /forgot-password, /reset-password
    member/         # Member portal: /card, /events, /attendance, /payments, /forum
    admin/          # Admin portal: /members, /applications, /events, /finance, /forum, /settings
    api/            # Edge API endpoints and webhooks
  components/
    ui/             # Base UI elements (buttons, inputs, cards, dialogs, badges)
    layout/         # Navigation bars, footers, sidebars (Public, Member, Admin)
    forms/          # React Hook Form + Zod form components
    member/         # Digital card, QR renderers, profile cards
    events/         # Event cards, capacity monitors, QR scanner
    finance/        # Invoices, transfer uploaders, ledger tables
  lib/
    supabase/       # Client, Server, and Admin Supabase instances
    permissions/    # RBAC matrix and capability checkers
    qr/             # QR token generation, hashing, and verification
    utils.ts        # Formatting, currency, dates, class merging
  types/
    database.ts     # Domain models and Supabase schema types
supabase/
  migrations/       # Production PostgreSQL migrations
  seed.sql          # Local development mock data
docs/
  architecture.md
  database.md
  permissions.md
  deployment.md
  admin-guide.md
```

## 4. Key Architectural Decisions
1. **Single Source of Truth for Member Number**: Generated via PostgreSQL sequence (`member_number_seq`) inside an atomic function (`generate_member_number()`) to prevent duplicate numbers under concurrent requests.
2. **Atomic Event Registration**: Capacity enforcement uses PostgreSQL `FOR UPDATE` row locking to eliminate race conditions where two simultaneous registrations could exceed capacity.
3. **Idempotent Financial Ledger**: Payment approvals execute via `approve_event_payment_atomic`, which atomically transitions invoice/registration states and writes exactly one cash transaction entry.
4. **Security Boundary**: Server-side validation and Supabase Row Level Security (RLS) are strictly enforced. Client-side route guards are UX enhancements only.
