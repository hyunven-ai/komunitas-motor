# RBAC Permission Matrix & Authorization Boundaries

## 1. Role Definitions

1. `super_admin`: Full system control, role assignment, audit logs, configuration, and emergency recovery.
2. `chairman`: Executive view, application approval, committee assignments, financial reporting, and announcements.
3. `admin`: General club administrative duties, member registration review, event publication, and CMS content.
4. `treasurer`: Finance accounts, manual transfer verification queue, invoice reconciliation, and ledger reporting.
5. `event_officer`: Road captain / touring coordinator; manages event capacities and conducts mobile QR check-ins.
6. `moderator`: Forum content review, topic locking/pinning, handling reports, and content hiding.
7. `member`: Verified community member; accesses digital KTA card, registers for events, views personal invoices, and posts on the forum.

## 2. Permission Capabilities Matrix

| Capability | super_admin | chairman | admin | treasurer | event_officer | moderator | member |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| View Admin Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage Member Database | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Review / Approve Applications | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles & Permissions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Committee Positions | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create & Publish Events | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| QR Code Attendance Check-In | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Verify Payments & Invoices | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Cash Ledgers & Reports | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Moderate Forum & Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Publish News & Gallery | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View System Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Access Member Portal & Card | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Participate in Member Forum | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 3. Row Level Security Enforcement
All permissions are mirrored in PostgreSQL RLS policies in `supabase/migrations/20261015000000_initial_schema.sql`.
Client-side checks are for user interface presentation only. Database access using client credentials will be strictly rejected if the user lacks the matching role or ownership.
