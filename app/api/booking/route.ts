import { isParisBookingDate } from "@/components/booking/availability";
import { Resend } from "resend";

const emailCopy = {
  fr: {
    subject: "Nouvelle demande",
    title: "Nouvelle demande de rendez-vous",
    flash: "Flash réservé",
    flashSubject: "Nouvelle demande pour un flash",
    name: "Nom",
    email: "E-mail",
    location: "Lieu",
    placement: "Emplacement",
    size: "Taille",
    notes: "Notes",
    references: "Références",
    noReferences: "Aucune référence ajoutée.",
  },
  en: {
    subject: "New Booking",
    title: "New Booking Request",
    flash: "Selected flash",
    flashSubject: "New flash booking",
    name: "Name",
    email: "Email",
    location: "Location",
    placement: "Placement",
    size: "Size",
    notes: "Notes",
    references: "References",
    noReferences: "No references uploaded.",
  },
  es: {
    subject: "Nueva solicitud",
    title: "Nueva solicitud de cita",
    flash: "Flash seleccionado",
    flashSubject: "Nueva solicitud para un flash",
    name: "Nombre",
    email: "Correo electrónico",
    location: "Lugar",
    placement: "Zona",
    size: "Tamaño",
    notes: "Notas",
    references: "Referencias",
    noReferences: "No se han añadido referencias.",
  },
  de: {
    subject: "Neue Anfrage",
    title: "Neue Terminanfrage",
    flash: "Ausgewählter Flash",
    flashSubject: "Neue Flash-Anfrage",
    name: "Name",
    email: "E-Mail",
    location: "Ort",
    placement: "Körperstelle",
    size: "Größe",
    notes: "Notizen",
    references: "Referenzen",
    noReferences: "Keine Referenzen hinzugefügt.",
  },
} as const;

export async function POST(req: Request) {
  try {
    const {
      name,
      instagram,
      email,
      locale = "fr",
      location,
      date,
      placement,
      size,
      budget,
      references,
      notes,
      flashTitle,
    } = await req.json();

    if (location === "Paris" && (typeof date !== "string" || !isParisBookingDate(date))) {
      return Response.json({ error: "Paris : choisis le 18 ou le 19 novembre 2026." }, { status: 400 });
    }

    const emailLocale = locale === "en" ? "en" : locale === "de" ? "de" : locale === "es" ? "es" : "fr";
    const copy = emailCopy[emailLocale];

    const images = references
      ? references
          .split("\n")
          .filter(Boolean)
          .map(
            (url: string) => `
              <a href="${url}" target="_blank">
                <img
                  src="${url}"
                  width="180"
                  style="
                    border-radius:16px;
                    margin:8px;
                    display:inline-block;
                  "
                />
              </a>
            `
          )
          .join("")
      : `<p>${copy.noReferences}</p>`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Booking <booking@clempope.com>",
      to: "clempopetattoo@gmail.com",
      replyTo: email,

      subject: flashTitle ? `${copy.flashSubject} • ${flashTitle} • ${name}` : `${copy.subject} • ${name}`,

      html: `
      <div style="font-family:Arial;padding:40px">

      <h1>${copy.title}</h1>

      <hr/>

      ${flashTitle ? `<p><strong>${copy.flash}</strong><br>${flashTitle}</p>` : ""}

      <p><strong>${copy.name}</strong><br>${name}</p>

      <p><strong>Instagram</strong><br>${instagram}</p>

      <p><strong>${copy.email}</strong><br>${email}</p>

      <p><strong>${copy.location}</strong><br>${location}</p>

      ${location === "Paris" ? `<p><strong>Date</strong><br>${new Intl.DateTimeFormat(emailLocale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))}</p>` : ""}

      <p><strong>${copy.placement}</strong><br>${placement}</p>

      <p><strong>${copy.size}</strong><br>${size}</p>

      <p><strong>Budget</strong><br>${budget}</p>

      <p><strong>${copy.notes}</strong><br>${notes || "-"}</p>

      <h2 style="margin-top:40px">
        ${copy.references}
      </h2>

      ${images}

      </div>
      `,
    });

    if (error) {
console.dir(error, { depth: null });      return Response.json(error, { status: 500 });
    }

    return Response.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        error: "Erreur interne du serveur",
      },
      {
        status: 500,
      }
    );
  }
}
