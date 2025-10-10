#!/usr/bin/env tsx

import { execSync } from 'child_process'
import './utils/loadEnv'

const migrationName = process.argv[2]

if (!migrationName) {
  console.error('Please provide a migration name')
  console.error('Usage: npm run db:generate <migration-name>')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Please configure your environment.')
  process.exit(1)
}

try {
  console.log(`Generating migration: ${migrationName}`)
  execSync(
    `npx drizzle-kit generate --config=drizzle.config.cjs --name=${migrationName}`,
    {
      stdio: 'inherit',
    }
  )
  console.log('Migration generated successfully!')
} catch (error) {
  console.error('Failed to generate migration:', error)
  process.exit(1)
}
