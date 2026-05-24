import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getDB } from '#/db/index'
import * as schema from '#/db/schema'

export function getAuth(env: any) {
  if (!env || !env.DB) {
    throw new Error('Cloudflare D1 DB binding is required but not provided in env context.')
  }
  const db = getDB(env.DB)
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
