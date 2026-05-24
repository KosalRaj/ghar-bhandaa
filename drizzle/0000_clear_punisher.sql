CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `invoice_line_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`kind` text NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `invoice_line_items_invoice_idx` ON `invoice_line_items` (`invoice_id`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`lease_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`period` text NOT NULL,
	`amount` integer NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lease_id`) REFERENCES `leases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `invoices_landlord_idx` ON `invoices` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `invoices_tenant_idx` ON `invoices` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `invoices_lease_idx` ON `invoices` (`lease_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_lease_period_idx` ON `invoices` (`lease_id`,`period`);--> statement-breakpoint
CREATE TABLE `landlords` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `landlords_email_unique` ON `landlords` (`email`);--> statement-breakpoint
CREATE TABLE `leases` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`room_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`rent_amount` integer NOT NULL,
	`deposit_amount` integer NOT NULL,
	`billing_day` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `leases_landlord_idx` ON `leases` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `leases_room_idx` ON `leases` (`room_id`);--> statement-breakpoint
CREATE INDEX `leases_tenant_idx` ON `leases` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `notifications_log` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`invoice_id` text,
	`tenant_id` text NOT NULL,
	`channel` text NOT NULL,
	`kind` text NOT NULL,
	`sent_at` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notifications_log_landlord_idx` ON `notifications_log` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `notifications_log_invoice_idx` ON `notifications_log` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `notifications_log_tenant_idx` ON `notifications_log` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `notifications_log_invoice_kind_idx` ON `notifications_log` (`invoice_id`,`kind`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`invoice_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`amount` integer NOT NULL,
	`method` text NOT NULL,
	`status` text DEFAULT 'initiated' NOT NULL,
	`gateway_ref` text,
	`bank_ref` text,
	`proof_object_key` text,
	`created_at` text NOT NULL,
	`confirmed_at` text,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payments_landlord_idx` ON `payments` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `payments_invoice_idx` ON `payments` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `payments_tenant_idx` ON `payments` (`tenant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `payments_gateway_ref_idx` ON `payments` (`gateway_ref`);--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `properties_landlord_idx` ON `properties` (`landlord_id`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`property_id` text NOT NULL,
	`name` text NOT NULL,
	`floor` text,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rooms_landlord_idx` ON `rooms` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `rooms_property_idx` ON `rooms` (`property_id`);--> statement-breakpoint
CREATE INDEX `rooms_landlord_property_idx` ON `rooms` (`landlord_id`,`property_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_email_unique` ON `tenants` (`email`);--> statement-breakpoint
CREATE INDEX `tenants_landlord_idx` ON `tenants` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `tenants_email_idx` ON `tenants` (`email`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
