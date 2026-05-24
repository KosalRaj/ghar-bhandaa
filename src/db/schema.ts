import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core'

// --- Better Auth Tables ---

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

// --- Domain Tables ---

export const landlords = sqliteTable('landlords', {
  id: text('id').primaryKey(), // maps to user.id
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  createdAt: text('created_at').notNull(), // ISO-8601 string
})

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id').notNull().references(() => landlords.id),
  name: text('name').notNull(),
  address: text('address').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('properties_landlord_idx').on(table.landlordId),
])

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id').notNull().references(() => landlords.id),
  propertyId: text('property_id').notNull().references(() => properties.id),
  name: text('name').notNull(), // name/number
  floor: text('floor'),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('rooms_landlord_idx').on(table.landlordId),
  index('rooms_property_idx').on(table.propertyId),
  index('rooms_landlord_property_idx').on(table.landlordId, table.propertyId),
])

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id').notNull().references(() => landlords.id),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('tenants_landlord_idx').on(table.landlordId),
  index('tenants_email_idx').on(table.email),
])

export const leases = sqliteTable('leases', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id').notNull().references(() => landlords.id),
  roomId: text('room_id').notNull().references(() => rooms.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  rentAmount: integer('rent_amount').notNull(), // in paisa
  depositAmount: integer('deposit_amount').notNull(), // in paisa
  billingDay: integer('billing_day').notNull(), // 1–28
  startDate: text('start_date').notNull(), // YYYY-MM-DD
  endDate: text('end_date'), // YYYY-MM-DD
  status: text('status').notNull().default('active'), // 'active' | 'ended'
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('leases_landlord_idx').on(table.landlordId),
  index('leases_room_idx').on(table.roomId),
  index('leases_tenant_idx').on(table.tenantId),
])

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id').notNull().references(() => landlords.id),
  leaseId: text('lease_id').notNull().references(() => leases.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  period: text('period').notNull(), // YYYY-MM
  amount: integer('amount').notNull(), // in paisa (denormalized total)
  dueDate: text('due_date').notNull(), // YYYY-MM-DD
  status: text('status').notNull().default('unpaid'), // 'unpaid' | 'partial' | 'paid' | 'overdue'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('invoices_landlord_idx').on(table.landlordId),
  index('invoices_tenant_idx').on(table.tenantId),
  index('invoices_lease_idx').on(table.leaseId),
  uniqueIndex('invoices_lease_period_idx').on(table.leaseId, table.period),
])

export const invoiceLineItems = sqliteTable('invoice_line_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: integer('amount').notNull(), // in paisa
  kind: text('kind').notNull(), // 'rent' | 'utility' | 'adjustment'
}, (table) => [
  index('invoice_line_items_invoice_idx').on(table.invoiceId),
])

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id').notNull().references(() => landlords.id),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  amount: integer('amount').notNull(), // in paisa
  method: text('method').notNull(), // 'khalti' | 'esewa' | 'bank_transfer' | 'cash'
  status: text('status').notNull().default('initiated'), // 'initiated' | 'pending_verification' | 'confirmed' | 'rejected' | 'failed'
  gatewayRef: text('gateway_ref'), // Khalti/eSewa transaction id
  bankRef: text('bank_ref'), // Reference typed by tenant
  proofObjectKey: text('proof_object_key'), // R2 screenshot key
  createdAt: text('created_at').notNull(),
  confirmedAt: text('confirmed_at'),
}, (table) => [
  index('payments_landlord_idx').on(table.landlordId),
  index('payments_invoice_idx').on(table.invoiceId),
  index('payments_tenant_idx').on(table.tenantId),
  uniqueIndex('payments_gateway_ref_idx').on(table.gatewayRef),
])

export const notificationsLog = sqliteTable('notifications_log', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id').notNull().references(() => landlords.id),
  invoiceId: text('invoice_id').references(() => invoices.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  channel: text('channel').notNull(), // 'email' | 'sms'
  kind: text('kind').notNull(), // 'reminder_before' | 'reminder_due' | 'reminder_overdue' | 'receipt'
  sentAt: text('sent_at').notNull(),
  status: text('status').notNull(), // 'sent' | 'failed'
}, (table) => [
  index('notifications_log_landlord_idx').on(table.landlordId),
  index('notifications_log_invoice_idx').on(table.invoiceId),
  index('notifications_log_tenant_idx').on(table.tenantId),
  index('notifications_log_invoice_kind_idx').on(table.invoiceId, table.kind),
])
