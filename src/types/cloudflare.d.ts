interface CloudflareBindings {
  DB: D1Database
  PROOFS: R2Bucket
  APP_BASE_URL: string
}

declare module 'cloudflare:workers' {
  export const env: CloudflareBindings
}
