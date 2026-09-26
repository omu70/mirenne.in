import postgres from "postgres";

/**
 * One pooled connection per server instance, reused across requests (and
 * across hot reloads in dev via globalThis). Use Supabase's *transaction
 * pooler* URL (port 6543) on Vercel — serverless functions open many short
 * connections — which is why prepared statements are off.
 */

declare global {
  var __mirenneSql: postgres.Sql | undefined;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set. Add your Supabase connection string to the environment.");
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function db(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  if (!globalThis.__mirenneSql) {
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    globalThis.__mirenneSql = postgres(url, {
      prepare: false,
      max: 5,
      idle_timeout: 20,
      ssl: local ? false : "require",
    });
  }
  return globalThis.__mirenneSql;
}
