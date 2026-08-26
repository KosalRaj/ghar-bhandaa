/**
 * @file Client-Side Authentication Client.
 * @description Exports the Better Auth React client singleton for managing authentication state,
 * sign-in, sign-up, sign-out, and active sessions in the browser.
 */

import { createAuthClient } from 'better-auth/react'

/**
 * Better Auth client singleton instance.
 *
 * @remarks
 * Used in frontend components and route loaders for:
 * - `authClient.useSession()` (React hook for active session data)
 * - `authClient.signIn.email()` (Email/password authentication)
 * - `authClient.signUp.email()` (New account creation)
 * - `authClient.signOut()` (Session termination)
 */
export const authClient = createAuthClient()
