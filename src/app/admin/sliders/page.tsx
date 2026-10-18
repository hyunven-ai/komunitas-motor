import { getHeroSlides } from "@/features/sliders/queries";
import { getSystemSettings } from "@/features/settings/queries";
import { SliderManagerClient } from "./slider-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminSlidersPage() {
  const [slides, settings] = await Promise.all([
    getHeroSlides(),
    getSystemSettings(),
  ]);

  return (
    <div className="space-y-6">
      <SliderManagerClient initialSlides={slides} initialSettings={settings} />
    </div>
  );
}
