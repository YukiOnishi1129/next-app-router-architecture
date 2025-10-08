import { config as loadEnv } from 'dotenv'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendRoot = resolve(__dirname, '../..')
const repoRoot = resolve(frontendRoot, '..')

const ENV_FILES_IN_PRIORITY = [
  resolve(repoRoot, '.env'),
  resolve(repoRoot, '.env.local'),
  resolve(frontendRoot, '.env'),
  resolve(frontendRoot, '.env.local'),
]

export function loadEnvFiles(): void {
  for (const envPath of ENV_FILES_IN_PRIORITY) {
    if (existsSync(envPath)) {
      loadEnv({ path: envPath, override: true })
    }
  }

  expandInterpolations()
}

function expandInterpolations() {
  const pattern = /\$\{([A-Z0-9_]+)\}/g
  const env = process.env

  let replaced = false

  do {
    replaced = false

    Object.entries(env).forEach(([key, value]) => {
      if (typeof value !== 'string') return

      const nextValue = value.replace(pattern, (_, varName) => {
        const replacement = env[varName]
        if (replacement === undefined) {
          return ''
        }
        replaced = true
        return replacement
      })

      env[key] = nextValue
    })
  } while (replaced)
}

// Automatically load when this module is imported to keep scripts minimal.
loadEnvFiles()
