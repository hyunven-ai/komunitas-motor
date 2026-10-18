import { getHeroSlides } from "@/features/sliders/queries";
import { SliderManagerClient } from "./slider-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminSlidersPage() {
  const slides = await getHeroSlides();

  return (
    <div className="space-y-6">
      <SliderManagerClient initialSlides={slides} />
    </div>
  );
}
