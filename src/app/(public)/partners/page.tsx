import { getActiveSponsors } from "@/features/sponsors/queries";
import { PartnersDirectoryClient } from "./partners-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner Resmi & Sponsorship | Brotherhood Motorcycle Community",
  description:
    "Direktori mitra resmi, penawaran benefit eksklusif anggota KTA Digital, serta informasi paket kemitraan sponsorship Brotherhood MC.",
};

export default async function PartnersPage() {
  const sponsors = await getActiveSponsors();

  return <PartnersDirectoryClient sponsors={sponsors} />;
}
