/**
 * @file Better Auth Server Initialization.
 * @description Configures and instantiates the Better Auth instance with Drizzle ORM SQLite adapter
 * and TanStack Start cookie management.
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { env as cfEnv } from 'cloudflare:workers'
import { getDB } from '#/db/index'
import * as schema from '#/db/schema'

/**
 * Creates and configures the Better Auth server instance using the provided Cloudflare environment.
 *
 * @param env - Optional environment object containing the Cloudflare D1 `DB` binding. If not provided, falls back to `cloudflare:workers` global `env`.
 * @returns Configured Better Auth instance with email/password authentication and TanStack Start cookies plugin.
 * @throws Error if the Cloudflare D1 `DB` binding is missing from the environment context.
 *
 * @example
 * ```ts
 * const auth = getAuth(context.env)
 * const session = await auth.api.getSession({ headers })
 * ```
 */
export function getAuth(env?: any) {
  const actualEnv = env?.DB ? env : cfEnv
  if (!actualEnv || !actualEnv.DB) {
    throw new Error(
      `Cloudflare D1 DB binding is required but not provided in env context. Resolved: ${JSON.stringify(
        Object.keys(actualEnv || {}),
      )}`,
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
