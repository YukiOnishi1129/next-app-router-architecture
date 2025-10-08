import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not defined. Ensure your environment variables are configured.'
  )
}

// Create a connection pool
const pool = new Pool({
  connectionString,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
})

// Create the Drizzle ORM instance
export const db = drizzle(pool, { schema })

// Export the pool for direct access if needed
export { pool }

// Helper function to close the connection pool (useful for testing)
export async function closeConnection() {
  await pool.end()
}
