import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Written against the real Prisma client, which isn't generated in
    // this environment — see README "Going to production with Postgres".
    "src/lib/data.db.ts",
    "src/lib/prisma.ts",
    "prisma/seed.ts",
  ]),
]);

export default eslintConfig;
