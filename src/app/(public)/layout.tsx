import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { FrontendPreloader } from "@/components/layout/frontend-preloader";
import { getSystemSettings } from "@/features/settings/queries";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSystemSettings();

  return (
    <div className="flex min-h-screen flex-col bg-charcoal text-bone">
      <FrontendPreloader />
      <PublicNavbar settings={settings} />
      <main className="flex-1 w-full min-h-[calc(100vh-80px)]">{children}</main>
      <PublicFooter settings={settings} />
    </div>
  );
}
