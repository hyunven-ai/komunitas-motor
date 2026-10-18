import { getSponsors, getSponsorInquiries } from "@/features/sponsors/queries";
import { fetchEventsList } from "@/features/events/queries";
import { SponsorsManagementClient } from "./sponsors-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manajemen Sponsorship & Partner | Admin Brotherhood MC",
  description: "Kelola daftar sponsor resmi, paket tier, benefit anggota, dan prospek kemitraan.",
};

export default async function AdminSponsorsPage() {
  const [sponsors, inquiries, events] = await Promise.all([
    getSponsors(),
    getSponsorInquiries(),
    fetchEventsList(),
  ]);

  return (
    <SponsorsManagementClient
      initialSponsors={sponsors}
      initialInquiries={inquiries}
      events={events.map((e) => ({ id: e.id || e.slug, title: e.title }))}
    />
  );
}
