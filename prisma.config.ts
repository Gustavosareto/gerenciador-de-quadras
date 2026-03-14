import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Usar DIRECT_URL para migrações (se disponível) para evitar problemas com PgBouncer
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
