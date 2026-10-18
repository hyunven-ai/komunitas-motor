import { getActiveSponsors } from "@/features/sponsors/queries";
import { MemberPerksClient } from "./perks-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Benefit & Diskon Partner | Portal Anggota Brotherhood MC",
  description: "Katalog voucher, kode promo, dan diskon bengkel/apparel khusus anggota aktif Brotherhood MC.",
};

export default async function MemberPerksPage() {
  const sponsors = await getActiveSponsors();
  // Filter only sponsors with memberPerk
  const perksSponsors = sponsors.filter((s) => s.memberPerk !== undefined);

  return <MemberPerksClient sponsors={perksSponsors} />;
}
