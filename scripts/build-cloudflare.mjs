import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../node_modules/@opennextjs/cloudflare/dist/cli/index.js", import.meta.url));
const result = spawnSync(process.execPath, [cli, "build"], {
  stdio: "inherit",
  env: { ...process.env, CLOUDFLARE_BUILD: "1" },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// OpenNext copies local .env values into this server-side fallback module.
// Production and local Worker tests must use their own runtime bindings instead.
writeFileSync(new URL("../.open-next/cloudflare/next-env.mjs", import.meta.url),
  "export const production = {};\nexport const development = {};\nexport const test = {};\n");
