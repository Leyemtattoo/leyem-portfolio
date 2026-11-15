import { Suspense } from "react";
import UnifiedFlashbook from "@/components/Flashbook/UnifiedFlashbook";

export default function FlashbookPage() {
  return <Suspense fallback={<div className="min-h-dvh bg-[#e9ecf0]" />}><UnifiedFlashbook /></Suspense>;
}
