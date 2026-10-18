export type AppRole =
  | "super_admin"
  | "chairman"
  | "admin"
  | "treasurer"
  | "event_officer"
  | "moderator"
  | "member";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "revision_requested";
export type MemberStatus = "active" | "inactive" | "suspended" | "honorary";
export type EventPublicationStatus = "draft" | "published" | "cancelled" | "completed";
export type RegistrationStatus = "registered" | "confirmed" | "cancelled" | "attended";
export type InvoiceStatus = "unpaid" | "submitted" | "paid" | "rejected" | "cancelled";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type TransactionType = "income" | "expense";
export type ArticleStatus = "draft" | "published";

export interface Profile {
  id: string; // references auth.users
  full_name: string;
  display_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  blood_type?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  city?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by?: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  user_id: string;
  member_number: string; // e.g., BMC-2026-0001
  status: MemberStatus;
  motorcycle_model?: string | null;
  motorcycle_plate?: string | null;
  motorcycle_year?: number | null;
  joined_date: string;
  qr_verification_token: string;
  qr_token_expires_at?: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  email?: string | null;
}

export interface MembershipApplication {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  city: string;
  motorcycle_model: string;
  motorcycle_plate: string;
  motorcycle_year: number;
  id_card_number?: string | null;
  driving_license_number?: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  reason_to_join: string;
  status: ApplicationStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  title: string; // e.g. "Ketua Umum", "Sekretaris Jenderal", "Bendahara"
  code: string;
  rank: number;
  description?: string | null;
  created_at: string;
}

export interface OfficerAssignment {
  id: string;
  member_id: string;
  position_id: string;
  period_start: string;
  period_end?: string | null;
  is_active: boolean;
  member?: Member;
  position?: Position;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url?: string | null;
  location_name: string;
  location_address?: string | null;
  map_link?: string | null;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  capacity: number;
  fee: number; // 0 for free events
  status: EventPublicationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  status: RegistrationStatus;
  registered_at: string;
  notes?: string | null;
  event?: Event;
  member?: Member;
}

export interface EventInvoice {
  id: string;
  invoice_number: string;
  event_id: string;
  member_id: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  created_at: string;
  updated_at: string;
  event?: Event;
  member?: Member;
}

export interface Payment {
  id: string;
  invoice_id: string;
  member_id: string;
  amount: number;
  bank_name: string;
  account_name: string;
  proof_url: string; // Supabase private bucket path
  status: PaymentStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  submitted_at: string;
  invoice?: EventInvoice;
  member?: Member;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  scanned_by: string;
  checked_in_at: string;
  method: "qr_scan" | "manual";
  notes?: string | null;
  member?: Member;
}

export interface AttendanceToken {
  id: string;
  event_id: string;
  member_id: string;
  token_hash: string;
  expires_at: string;
  is_revoked: boolean;
  created_at: string;
}

export interface FinanceAccount {
  id: string;
  name: string; // e.g. "Kas Utama Tunai", "BCA Brotherhood"
  account_number?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FinanceTransaction {
  id: string;
  account_id: string;
  payment_id?: string | null;
  event_id?: string | null;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  reference_number?: string | null;
  recorded_by: string;
  transaction_date: string;
  created_at: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order_index: number;
  icon?: string | null;
  created_at: string;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_hidden: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: ForumCategory;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ForumReport {
  id: string;
  topic_id?: string | null;
  post_id?: string | null;
  reported_by: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  resolved_by?: string | null;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url?: string | null;
  status: ArticleStatus;
  published_at?: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "urgent";
  author_id: string;
  expires_at?: string | null;
  created_at: string;
  author?: Profile;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  event_id?: string | null;
  cover_image_url?: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface GalleryMedia {
  id: string;
  album_id: string;
  media_url: string;
  caption?: string | null;
  alt_text?: string | null;
  order_index: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}
