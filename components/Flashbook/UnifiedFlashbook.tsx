"use client";

import Link from "next/link";
import { framaBlack, neueMontrealRegular } from "@/app/fonts";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import SiteFooter from "@/components/ui/SiteFooter";

const copy = {
  fr: { empty: "Aucun flash disponible pour le moment.", home: "Retour à l’accueil" },
  en: { empty: "No flashes available right now.", home: "Back home" },
  de: { empty: "Derzeit sind keine Flashs verfügbar.", home: "Zurück zur Startseite" },
  es: { empty: "No hay flashes disponibles por el momento.", home: "Volver al inicio" },
};

export default function UnifiedFlashbook() {
  const { locale } = useTranslation();
  const text = copy[locale];

  return (
    <main className={`${neueMontrealRegular.className} flex min-h-dvh flex-col bg-[#e9ecf0] text-[#202020]`}>
      <section id="draw" className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-start justify-center px-6 py-24 sm:px-9">
        <h1 className={`${framaBlack.className} text-[clamp(2.65rem,10vw,6.8rem)] uppercase leading-none tracking-tight text-[#e70101]`}>
          Flashbook
        </h1>
        <p className="mt-4">{text.empty}</p>
        <Link href="/" className="mt-8 underline underline-offset-4">
          {text.home}
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
