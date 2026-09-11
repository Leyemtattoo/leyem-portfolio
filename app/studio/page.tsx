import type { Metadata } from "next";
import PlacementStudio from "@/components/studio/PlacementStudio";

export const metadata: Metadata = {
  title: "Studio de placement · Leyem",
  robots: { index: false, follow: false },
};

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ design?: string; mode?: string }> }) {
  const params = await searchParams;
  const parsedDesign = Number(params.design);
  const designNumber = ([1, 2, 3, 4] as const).find((number) => number === parsedDesign) ?? 1;
  return <PlacementStudio designNumber={designNumber} allowUpload={params.mode === "admin"} />;
}
