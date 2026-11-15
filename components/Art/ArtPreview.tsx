"use client";

import Image from "next/image";
import { framaBlack, neueMontrealRegular } from "@/app/fonts";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import styles from "./ArtPreview.module.css";

const copy = {
  fr: {
    label: "L’atelier",
    heading: "De la peau au papier.",
    description: "Un autre support, le même univers. Des images à contempler, à encadrer, à garder près de soi.",
    status: "Collection à venir",
    footer: "Des images qui restent.",
    back: "Retour en haut",
  },
  en: {
    label: "The studio", heading: "From skin to paper.",
    description: "A different medium, the same world. Images to contemplate, frame and keep close.",
    status: "Collection coming soon",
    footer: "Images that stay with you.", back: "Back to top",
  },
  de: {
    label: "Das Atelier", heading: "Von der Haut aufs Papier.",
    description: "Ein anderes Medium, dieselbe Welt. Bilder zum Betrachten, Einrahmen und Behalten.",
    status: "Kollektion erscheint bald",
    footer: "Bilder, die bleiben.", back: "Nach oben",
  },
  es: {
    label: "El taller", heading: "De la piel al papel.",
    description: "Otro soporte, el mismo universo. Imágenes para contemplar, enmarcar y tener cerca.",
    status: "Colección próximamente",
    footer: "Imágenes que permanecen.", back: "Volver arriba",
  },
};

export default function ArtPreview() {
  const { locale } = useTranslation();
  const text = copy[locale];

  return (
    <section id="art-prints" aria-labelledby="art-title" className={`${styles.section} ${neueMontrealRegular.className}`}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}><span>{text.label}</span><span>LEYEM</span></div>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>{text.heading}</p>
            <h2 id="art-title" className={`${framaBlack.className} ${styles.title}`}>ART &<br />PRINTS<span className={styles.asterisk} aria-hidden="true">✳</span></h2>
          </div>
          <div className={styles.intro}>
            <p>{text.description}</p>
            <span className={styles.badge}><span aria-hidden="true" />{text.status}</span>
          </div>
        </header>

        <div className={styles.comingSoon}>
          <Image
            src="/images/cat.gif"
            alt={{ fr: "Un chat qui dort", en: "A sleeping cat", de: "Eine schlafende Katze", es: "Un gato durmiendo" }[locale]}
            width={714}
            height={554}
            unoptimized
            className={styles.sleepingCat}
          />
          <p className={`${framaBlack.className} ${styles.comingSoonTitle}`}>COMING SOON ...</p>
        </div>

        <footer className={styles.footer}>
          <span>{text.footer}</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>{text.back} <span aria-hidden="true">↑</span></button>
        </footer>
      </div>

    </section>
  );
}
