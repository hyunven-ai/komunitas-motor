import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { FrontendPreloader } from "@/components/layout/frontend-preloader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-charcoal text-bone">
      <FrontendPreloader />
      <PublicNavbar />
      <main className="flex-1 w-full min-h-[calc(100vh-80px)]">{children}</main>
      <PublicFooter />
    </div>
  );
}
