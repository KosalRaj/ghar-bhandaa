/**
 * @file Database Client Factory.
 * @description Provides a factory function to instantiate a Drizzle ORM client backed by Cloudflare D1.
 */

import { drizzle } from 'drizzle-orm/d1'
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import * as schema from './schema'

/**
 * Initializes and returns a typed Drizzle ORM database instance bound to Cloudflare D1.
 *
 * @param d1 - The native Cloudflare D1 database binding instance.
 * @returns A typed Drizzle client with full relational querying and schema support.
 *
 * @example
 * ```ts
 * const db = getDB(env.DB)
 * const propertyList = await db.query.properties.findMany()
 * ```
 */
export function getDB(d1: D1Database) {
  return drizzle(d1, { schema })
}

/**
 * Represents the typed SQLite database instance returned by Drizzle ORM with the Ghar-Bhandaa schema.
 */
export type Database = BaseSQLiteDatabase<'async', any, typeof schema>
