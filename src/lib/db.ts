import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Vercel/Cloud DB require SSL usually
  const isProduction = process.env.NODE_ENV === "production";
  const pool =
    globalForPrisma.pool ??
    new pg.Pool({
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    });

  if (!isProduction) {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  const log = isProduction ? (["error"] as const) : (["warn", "error"] as const);

  const client = new PrismaClient({ adapter, log: [...log] });
  return client;
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
