"use client";

import Image from "next/image";
import Link from "next/link";
import { framaBlack, neueMontrealRegular } from "@/app/fonts";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import SiteFooter from "@/components/ui/SiteFooter";

const copy = {
  fr: { placement: "Essayer le placement", home: "Retour à l’accueil" },
  en: { placement: "Try the placement", home: "Back home" },
  de: { placement: "Platzierung ausprobieren", home: "Zurück zur Startseite" },
  es: { placement: "Probar la colocación", home: "Volver al inicio" },
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
        <article id="designs" className="mt-8 w-full max-w-xs overflow-hidden rounded-2xl bg-white">
          <Image
            src="/images/flashbook/TEST-01.webp"
            alt="Mary Bird"
            width={2480}
            height={3508}
            sizes="(max-width: 368px) calc(100vw - 48px), 320px"
            className="h-auto w-full"
          />
          <div className="p-5 pt-0">
            <h2 className="text-xl font-bold">Mary Bird</h2>
            <Link href="/studio?design=1" className="mt-2 inline-block underline underline-offset-4">
              {text.placement}
            </Link>
          </div>
        </article>
        <Link href="/" className="mt-8 underline underline-offset-4">
          {text.home}
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
