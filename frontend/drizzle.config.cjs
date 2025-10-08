/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require("drizzle-kit");
const { config: loadEnv } = require("dotenv");
const { existsSync } = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const frontendRoot = __dirname;

const ENV_FILES_IN_PRIORITY = [
  path.resolve(repoRoot, ".env"),
  path.resolve(repoRoot, ".env.local"),
  path.resolve(frontendRoot, ".env"),
  path.resolve(frontendRoot, ".env.local"),
];

for (const envPath of ENV_FILES_IN_PRIORITY) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: true });
  }
}

expandEnv(process.env);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined. Please configure it in your .env files."
  );
}

module.exports = defineConfig({
  schema: "./src/external/client/db/schema/index.ts",
  out: "./src/external/client/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

function expandEnv(env) {
  const pattern = /\$\{([A-Z0-9_]+)\}/g;
  let replaced;

  do {
    replaced = false;

    for (const key of Object.keys(env)) {
      const value = env[key];
      if (typeof value !== "string") continue;

      const nextValue = value.replace(pattern, (_, varName) => {
        const replacement = env[varName];
        if (replacement === undefined) {
          return "";
        }
        replaced = true;
        return replacement;
      });

      if (nextValue !== value) {
        env[key] = nextValue;
      }
    }
  } while (replaced);
}
