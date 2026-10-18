# Database Schema & Data Integrity Guide

## 1. Core Tables & Responsibilities

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| `profiles` | User profile details (bio, blood type, emergency contact) | `id` -> `auth.users.id` |
| `user_roles` | Role assignments for RBAC authorization | `user_id` -> `auth.users.id` |
| `members` | Official club members with generated KTA number | `user_id` -> `auth.users.id` |
| `membership_applications` | Prospective member applications awaiting review | `user_id` -> `auth.users.id` (optional) |
| `positions` | Organizational hierarchy positions | None |
| `officer_assignments` | Active committee assignments | `member_id`, `position_id` |
| `events` | Touring and gathering events | `created_by` -> `auth.users.id` |
| `event_registrations` | Event registrations with status tracking | `event_id`, `member_id` |
| `event_invoices` | Automated event invoices for member fees | `event_id`, `member_id` |
| `payments` | Submitted manual transfer proofs & verification queue | `invoice_id`, `member_id` |
| `finance_accounts` | Bank and cash physical accounts | None |
| `finance_transactions` | Immutable cash ledger entries | `account_id`, `payment_id` |
| `attendance_records` | Check-in logs verified via QR or manual staff action | `event_id`, `member_id`, `scanned_by` |
| `attendance_tokens` | Ephemeral signed/hashed QR check-in tokens | `event_id`, `member_id` |
| `forum_categories` | Forum classification categories | None |
| `forum_topics` | Community discussion threads | `category_id`, `author_id` |
| `forum_posts` | Thread replies and comments | `topic_id`, `author_id` |
| `forum_reports` | Content moderation reports | `topic_id`/`post_id`, `reported_by` |
| `news_articles` | Public news and press releases | `author_id` -> `auth.users.id` |
| `announcements` | High-priority broadcasts for members | `author_id` -> `auth.users.id` |
| `gallery_albums` | Photo albums linked to events or gatherings | `event_id` (optional), `created_by` |
| `gallery_media` | Media files belonging to albums | `album_id` |
| `audit_logs` | Audit trail for security and financial actions | `user_id` -> `auth.users.id` |

## 2. Integrity & Concurrency Controls
- **Concurrency-Safe KTA Generator**: Uses a PostgreSQL `SEQUENCE` (`member_number_seq`) combined with formatted prefix `'BMC-' || YYYY || '-' || 0001` inside `generate_member_number()`.
- **Atomic Capacity Gate**: `register_for_event_atomic` acquires a row lock (`FOR UPDATE`) on the target event, checks active registration count against `capacity`, and creates registration + invoice in a single database transaction.
- **Idempotent Payment Post**: `approve_event_payment_atomic` ensures that subsequent or retried clicks by the treasurer do not create multiple cash ledger records.
- **Strict Financial Types**: All monetary values use PostgreSQL `NUMERIC(12,2)` rather than floating-point numbers.
