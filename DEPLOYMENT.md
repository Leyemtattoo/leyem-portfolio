# Netlify deployment

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
