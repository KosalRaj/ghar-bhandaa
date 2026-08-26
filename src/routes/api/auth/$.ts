import { createFileRoute } from '@tanstack/react-router'
import { env as cfEnv } from 'cloudflare:workers'
import { getAuth } from '#/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request, context }) => {
        const env =
          (context as any).cloudflare?.env || (context as any).env || cfEnv
        const auth = getAuth(env)
        return auth.handler(request)
      },
      POST: ({ request, context }) => {
        const env =
          (context as any).cloudflare?.env || (context as any).env || cfEnv
        const auth = getAuth(env)
        return auth.handler(request)
      },
    },
  },
})
