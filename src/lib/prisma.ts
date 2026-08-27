import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Uses the pg driver adapter + Prisma's queryCompiler preview feature
// (see prisma/schema.prisma generator block) instead of the native Rust
// query engine binary. This matters for two reasons:
//  1. It's the right choice for serverless/edge deploys (Vercel, etc.) —
//     no native binary to bundle or cold-start.
//  2. It's the only path this Prisma setup was actually reachable to test
//     from in the sandbox this project was built in, which blocks direct
//     binary downloads from binaries.prisma.sh. `prisma generate` and
//     `prisma migrate` are dev-time tools you'll run locally where that
//     restriction doesn't apply — see README "Going to production" section.
//
// Standard Next.js singleton pattern to avoid exhausting Postgres
// connections from hot-reloading in dev.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env before using the Postgres-backed data layer."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
