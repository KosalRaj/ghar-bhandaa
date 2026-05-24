import { createMiddleware } from '@tanstack/react-start'
import { getAuth } from '#/lib/auth'
import { getDB } from '#/db/index'
import { landlords } from '#/db/schema'
import { eq } from 'drizzle-orm'

export const landlordAuthMiddleware = createMiddleware({ type: 'function' })
  .server(async ({ next, request, context }) => {
    const env = (context as any).cloudflare?.env || (context as any).env || context
    
    if (!env || !env.DB) {
      throw new Error('Database binding DB is missing from environment context')
    }

    const auth = getAuth(env)
    const sessionRes = await auth.api.getSession({
      headers: request.headers,
    })

    if (!sessionRes || !sessionRes.user) {
      throw new Response('Unauthorized', { status: 401 })
    }

    const db = getDB(env.DB)

    // Verify the user exists in the landlords table
    const landlord = await db.query.landlords.findFirst({
      where: eq(landlords.id, sessionRes.user.id),
    })

    if (!landlord) {
      throw new Response('Forbidden: User is not registered as a landlord', { status: 403 })
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
