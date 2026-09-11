import Hero from "@/components/Hero/Hero";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return <Hero enterFromFlashbook={from === "flashbook"} />;
}
