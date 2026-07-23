import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL (non-pooled) is what Prisma Migrate needs to run DDL against
    // Supabase's pooled connection setup — see the deploy guide.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
