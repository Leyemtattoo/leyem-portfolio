// Vercel Blob uses undici in Node.js; Workers provide fetch natively.
export const fetch = globalThis.fetch.bind(globalThis);
