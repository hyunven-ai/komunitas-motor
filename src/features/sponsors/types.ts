export type SponsorTier = "main" | "official" | "event" | "supporting";

export type BusinessCategory =
  | "automotive_parts"
  | "workshop_service"
  | "apparel_gear"
  | "oil_fluids"
  | "hospitality_cafe"
  | "other";

export interface MemberPerk {
  title: string;
  discountText: string;
  promoCode?: string;
  terms?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  slug: string;
  tier: SponsorTier;
  category: BusinessCategory;
  logoUrl: string;
  bannerUrl?: string;
  websiteUrl?: string;
  description: string;
  status: "active" | "inactive" | "expired";
  order: number;
  startDate?: string;
  endDate?: string;
  memberPerk?: MemberPerk;
  assignedEventIds?: string[];
  clickCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  tierInterest: SponsorTier;
  category: BusinessCategory;
  message: string;
  status: "new" | "contacted" | "approved" | "rejected";
  createdAt: string;
}
