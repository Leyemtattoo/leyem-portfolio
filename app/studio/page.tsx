import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PlacementStudio from "@/components/studio/PlacementStudio";

export const metadata: Metadata = {
  title: "Studio de placement · Leyem",
  robots: { index: false, follow: false },
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ design?: string | string[]; mini?: string | string[]; mode?: string | string[] }>;
}) {
  const { design, mini, mode } = await searchParams;

  if ((design !== undefined && design !== "1") || mini !== undefined || mode !== undefined) {
    redirect("/flashbook");
  }

  return <PlacementStudio designNumber={1} />;
}
