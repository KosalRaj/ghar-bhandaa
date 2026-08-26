/**
 * @file Landlord Authentication and Tenancy Middleware.
 * @description TanStack Start server function middleware enforcing session authentication
 * and multi-tenant landlord authorization.
 */

import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getAuth } from '#/lib/auth'
import { getDB } from '#/db/index'
import { landlords } from '#/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Server middleware that verifies the user's active session and confirms their registration
 * in the `landlords` table.
 *
 * @throws `Response` with status `401 Unauthorized` if the session token is missing or invalid.
 * @throws `Response` with status `403 Forbidden` if the user is authenticated but not registered as a landlord.
 * @throws `Error` if the Cloudflare D1 `DB` binding is missing from the request context.
 *
 * @remarks
 * Downstream context injections:
 * - `env`: Resolved Cloudflare Worker environment object.
 * - `db`: Initialized Drizzle ORM database instance.
 * - `user`: Authenticated user entity from Better Auth.
 * - `session`: Active session entity from Better Auth.
 * - `landlordId`: Verified landlord primary key UUID (used for multi-tenant data isolation).
 *
 * @example
 * ```ts
 * export const myServerFn = createServerFn({ method: 'GET' })
 *   .middleware([landlordAuthMiddleware])
 *   .handler(async ({ context }) => {
 *     const { db, landlordId } = context
 *     return await db.query.properties.findMany({ where: eq(properties.landlordId, landlordId) })
 *   })
 * ```
 */
export const landlordAuthMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next, context }) => {
  const env =
    (context as any).cloudflare?.env || (context as any).env || context

  if (!env || !env.DB) {
    throw new Error('Database binding DB is missing from environment context')
  }

  const headers = getRequestHeaders()
  const auth = getAuth(env)
  const sessionRes = await auth.api.getSession({
    headers,
  })

  if (!sessionRes) {
    throw new Response('Unauthorized', { status: 401 })
  }

  const db = getDB(env.DB)

  // Verify the user exists in the landlords table
  const landlord = await db.query.landlords.findFirst({
    where: eq(landlords.id, sessionRes.user.id),
  })

  if (!landlord) {
    throw new Response('Forbidden: User is not registered as a landlord', {
      status: 403,
    })
  }

  return next({
    context: {
      env,
      db,
      user: sessionRes.user,
      session: sessionRes.session,
      landlordId: landlord.id,
    },
  })
})
