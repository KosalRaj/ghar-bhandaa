import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { env as cfEnv } from 'cloudflare:workers'
import { getDB } from '#/db/index'
import * as schema from '#/db/schema'

export function getAuth(env?: any) {
  const actualEnv = env?.DB ? env : cfEnv
  if (!actualEnv || !actualEnv.DB) {
    throw new Error(
      `Cloudflare D1 DB binding is required but not provided in env context. Resolved: ${JSON.stringify(
        Object.keys(actualEnv || {})
      )}`
    )
  }
  const db = getDB(actualEnv.DB)
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [tanstackStartCookies()],
  })
}
