import type { Metadata } from "next";
import { miniFlashDesigns } from "@/components/Flashbook/miniFlashes";
import PlacementStudio from "@/components/studio/PlacementStudio";

export const metadata: Metadata = {
  title: "Studio de placement · Leyem",
  robots: { index: false, follow: false },
};

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ design?: string; mini?: string; mode?: string }> }) {
  const params = await searchParams;
  const parsedDesign = Number(params.design);
  const designNumber = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).find((number) => number === parsedDesign) ?? 1;
  const miniIndex = params.mini !== undefined && /^\d+$/.test(params.mini) && miniFlashDesigns[Number(params.mini)] ? Number(params.mini) : undefined;
  return <PlacementStudio miniIndex={miniIndex} designNumber={designNumber} allowUpload={params.mode === "admin"} />;
}
