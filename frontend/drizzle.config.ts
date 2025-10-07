import { defineConfig } from "drizzle-kit";
import "./scripts/utils/loadEnv";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined. Please configure it in your .env files."
  );
}

export default defineConfig({
  schema: "./src/external/client/db/schema/index.ts",
  out: "./src/external/client/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
