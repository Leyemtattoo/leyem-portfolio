# Cloudflare migration

The migration is prepared on `cloudflare-migration`. Keep Netlify serving
`clempope.com` until the Cloudflare preview and real booking flow are verified.

## Cloudflare Workers setup

Use **Workers**, with the OpenNext adapter, rather than a static Pages upload.
The repository includes `wrangler.jsonc` and `open-next.config.ts`.

In Cloudflare's Git deployment setup, connect
`Leyemtattoo/leyem-portfolio`, select branch `cloudflare-migration`, and use:

- Worker name: `clempope-portfolio` (must match `wrangler.jsonc`).
- Root directory: repository root.
- Build command: `npm run cf:build`.
- Deploy command: `npx opennextjs-cloudflare deploy`.
- Node.js: 22.12 or newer; Node.js 22 is also configured in `.node-version`.

Configure these two **runtime secrets** on the Worker before testing bookings:

- `RESEND_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

Use the existing values securely. They must never be committed to Git.
The email client is initialized per request, so building does not require
the Resend secret. The build script clears OpenNext's local `.env` fallback
module so local credentials are not embedded in the deployed Worker. Supply
local preview credentials through an ignored `.dev.vars` file instead.
Vercel Blob remains the photo storage provider; moving the
website does not move that account or change its usage limits.

## Validation

- `npm run cf:build`: production build and Cloudflare bundle.
- `npx wrangler deploy --dry-run`: check the bundle and compressed Worker size.
- `npm run cf:preview`: build and run the Worker with the prerendered cache
  populated. Use local-only test secrets in `.dev.vars` for checks that must
  not deliver emails or upload photos.

Pages that are prerendered at build time use the read-only static assets cache.
The project does not use ISR, so no R2 cache bucket is needed. Cloudflare builds
serve original images without the optional paid image transformation service.
Netlify builds retain their default image optimization behavior.
The Cloudflare build maps Vercel Blob's HTTP client to native `fetch`, avoiding
Node.js-only WebAssembly initialization in the Worker runtime.

The upload and booking APIs must also be tested on the actual `workers.dev`
URL before switching the live domain. Confirm that the plan supports the
compressed Worker size reported by the dry run. Do not assume Free fits.

## Domain cutover

1. Add `clempope.com` to Cloudflare using the Free DNS zone plan. Import and
   compare **all** existing Viaduc records, especially MX, DKIM, `rsend`, and
   `send`. Keep the web records pointing at Netlify during this stage.
2. Change nameservers at Viaduc to the exact two assigned by Cloudflare only
   after the imported zone matches. Check whether DNSSEC is active and follow
   Cloudflare's onboarding instructions for it before changing nameservers.
3. Once the zone is active and the Worker preview passes, add `clempope.com`
   and `www.clempope.com` as Worker custom domains in Cloudflare. Resolve any
   conflicting web records as directed by Cloudflare. Preserve mail records.
4. Verify public HTTPS on both names, the gallery, placement, photo attachment,
   and an owner-authorized booking email. Keep the Netlify project for rollback.

# Netlify deployment (current host / rollback)

The project uses Next.js server routes. Deploy with Netlify's Next.js adapter;
do not upload `public/` as a standalone static site.

`netlify.toml` declares Node.js 22, `npm run build`, and the `.next` output.
Netlify automatically installs its maintained Next.js adapter.

## Environment variables

Configure these secrets in Netlify before the first build and deployment:

- `RESEND_API_KEY`: the existing Resend sending key for `clempope.com`.
- `BLOB_READ_WRITE_TOKEN`: the existing Vercel Blob token used by `/api/upload`.

Transfer values securely from local configuration. Never commit `.env.local`
or paste secret values into chat. Hosting on Netlify does not migrate the
existing Blob storage; its account and usage limits remain separate.

## First preview

1. Connect this source project to the owner's Netlify account.
2. Configure the environment variables above.
3. Build and deploy a test version using Netlify's framework integration.
4. Check the home page, flash gallery, body placement, image upload, and a
   booking submission explicitly authorized by the owner.
5. Confirm receipt at `clempopetattoo@gmail.com` and that Reply targets the
   customer's address. An API success means Resend accepted the request;
   inbox delivery must be checked separately.

## Custom domain

After the preview works, add `clempope.com` and `www.clempope.com` in Netlify.
Use the exact DNS targets returned for that project. Update only the web
records in Viaduc, preserving mail records, including `resend._domainkey`,
`rsend`, `send`, and existing MX records. Verify HTTPS after DNS propagation.

Choose the paid plan only after preview validation and monitor usage credits.
