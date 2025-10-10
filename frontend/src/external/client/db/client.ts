import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

type DrizzleDatabase = NodePgDatabase<typeof schema>

let cachedPool: Pool | null = null
let cachedDb: DrizzleDatabase | null = null

const ensureConnections = () => {
  if (cachedPool && cachedDb) {
    return { pool: cachedPool, db: cachedDb }
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not defined. Ensure your environment variables are configured.'
    )
  }

  if (!cachedPool) {
    cachedPool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    })
  }

  if (!cachedDb) {
    cachedDb = drizzle(cachedPool, { schema })
  }

  return { pool: cachedPool, db: cachedDb }
}

const createLazyProxy = <T extends object>(resolver: () => T): T =>
  new Proxy({} as T, {
    get(_target, property, receiver) {
      const instance = resolver()
      const value = Reflect.get(instance, property, receiver)
      return typeof value === 'function' ? value.bind(instance) : value
    },
  })

export const db: DrizzleDatabase = createLazyProxy(() => ensureConnections().db)
export const pool: Pool = createLazyProxy(() => ensureConnections().pool)

export const getDb = () => ensureConnections().db
export const getPool = () => ensureConnections().pool

export async function closeConnection() {
  if (cachedPool) {
    await cachedPool.end()
    cachedPool = null
    cachedDb = null
  }
}
