import { redirect } from "next/navigation";

export default async function FlashbookGalleryPage({ searchParams }: {
  searchParams: Promise<{ selected?: string | string[] }>;
}) {
  const { selected } = await searchParams;
  const design = typeof selected === "string" && /^[1-4]$/.test(selected) ? selected : undefined;
  redirect(design ? `/flashbook?selected=${design}` : "/flashbook");
}
