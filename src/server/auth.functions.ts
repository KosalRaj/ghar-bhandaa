/**
 * @file Landlord Authentication Server Functions.
 * @description RPC server functions handling landlord registration and session state verification.
 */

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getAuth } from '#/lib/auth'
import { getDB } from '#/db/index'
import { landlords } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { env as cfEnv } from 'cloudflare:workers'
import { getCurrentDateTimeInKathmandu } from '#/lib/dates'

/**
 * Registers a new landlord account.
 *
 * @remarks
 * Execution workflow:
 * 1. Creates a Better Auth user account via `signUpEmail`.
 * 2. Inserts a corresponding row in the `landlords` table within a transactional boundary.
 * 3. Invariant: `landlords.id` matches `user.id` 1:1.
 *
 * @param data.name - Full name of the landlord.
 * @param data.email - Valid unique email address.
 * @param data.password - Password (min 6 characters).
 * @param data.phone - Optional contact phone number.
 * @returns An object `{ success: true }` upon successful registration.
 * @throws Error if email is already in use or database insertion fails.
 */
export const registerLandlord = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      phone: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    const env =
      (context as any).cloudflare?.env || (context as any).env || cfEnv
    const auth = getAuth(env)
    const db = getDB(env.DB)

    return await db.transaction(async (tx) => {
      const signUpRes = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: data.name,
        },
      })

      await tx.insert(landlords).values({
        id: signUpRes.user.id,
        email: signUpRes.user.email,
        name: signUpRes.user.name,
        phone: data.phone || null,
        createdAt: getCurrentDateTimeInKathmandu(),
      })

      return { success: true }
    })
  })

/**
 * Checks the authentication and landlord registration status of the current request.
 *
 * @remarks
 * Used in route guards (e.g. `_authed.tsx` `beforeLoad`) to verify whether the incoming user
 * has an active session and is recognized as a landlord.
 *
 * @returns Status object:
 * - `{ authenticated: true, user, landlord }` if authenticated and registered.
 * - `{ authenticated: false, reason: 'unauthenticated' | 'not_landlord' | 'database_missing' }` otherwise.
 */
export const checkLandlordAuth = createServerFn({ method: 'GET' }).handler(
  async ({ context }) => {
    const env =
      (context as any).cloudflare?.env || (context as any).env || cfEnv
    if (!env || !env.DB) {
      return { authenticated: false, reason: 'database_missing' }
    }

    const headers = getRequestHeaders()
    const auth = getAuth(env)
    const sessionRes = await auth.api.getSession({
      headers,
    })

    if (!sessionRes) {
      return { authenticated: false, reason: 'unauthenticated' }
    }

    const db = getDB(env.DB)
    const landlord = await db.query.landlords.findFirst({
      where: eq(landlords.id, sessionRes.user.id),
    })

    if (!landlord) {
      return { authenticated: false, reason: 'not_landlord' }
    }

    return {
      authenticated: true,
      user: sessionRes.user,
      landlord: {
        id: landlord.id,
        name: landlord.name,
        email: landlord.email,
      },
    }
  },
)
