import Link from "next/link";
import ArtPreview from "@/components/Art/ArtPreview";

export default function ArtPage() {
  return (
    <main className="min-h-dvh bg-[#f2efe9] text-[#242321]">
      <Link href="/" aria-label="clempope · Home" className="mx-6 mt-6 inline-flex min-h-12 items-center gap-3 rounded-full border border-black/15 px-5">← clempope</Link>
      <ArtPreview />
    </main>
  );
}
