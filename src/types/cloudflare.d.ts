interface D1Database {
  prepare: (query: string) => any
  dump: () => Promise<ArrayBuffer>
  batch: <T = unknown>(statements: any[]) => Promise<any[]>
  exec: (query: string) => Promise<any>
}

interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  error?: string
  meta: Record<string, any>
}

interface R2Bucket {
  get: (key: string) => Promise<any>
  put: (key: string, value: any) => Promise<any>
  delete: (key: string | string[]) => Promise<void>
  list: (options?: any) => Promise<any>
}

interface CloudflareBindings {
  DB: D1Database
  PROOFS: R2Bucket
  APP_BASE_URL: string
}

declare module 'cloudflare:workers' {
  export const env: CloudflareBindings
}
