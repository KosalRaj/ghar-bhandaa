import { createServerFn } from '@tanstack/react-start'
import { getAuth } from '#/lib/auth'
import { getDB } from '#/db/index'
import { landlords } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { env as cfEnv } from 'cloudflare:workers'

export const registerLandlord = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      phone: z.string().optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    const env = (context as any).cloudflare?.env || (context as any).env || cfEnv
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

      if (!signUpRes || !signUpRes.user) {
        throw new Error('Better Auth registration failed')
      }

      await tx.insert(landlords).values({
        id: signUpRes.user.id,
        email: signUpRes.user.email,
        name: signUpRes.user.name,
        phone: data.phone || null,
        createdAt: new Date().toISOString(),
      })

      return { success: true }
    })
  })

export const checkLandlordAuth = createServerFn({ method: 'GET' })
  .handler(async ({ request, context }) => {
    const env = (context as any).cloudflare?.env || (context as any).env || cfEnv
    if (!env || !env.DB) {
      return { authenticated: false, reason: 'database_missing' }
    }

    const auth = getAuth(env)
    const sessionRes = await auth.api.getSession({
      headers: request.headers,
    })

    if (!sessionRes || !sessionRes.user) {
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
  })
