#!/usr/bin/env tsx

import { migrate } from 'drizzle-orm/node-postgres/migrator'

import './utils/loadEnv'
import { db, closeConnection } from '../src/external/client/db/client'

async function main() {
  console.log('Running migrations...')

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Please configure your environment.')
    process.exit(1)
  }

  try {
    await migrate(db, {
      migrationsFolder: './src/external/client/db/migrations',
    })
    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await closeConnection()
  }
}

main()
