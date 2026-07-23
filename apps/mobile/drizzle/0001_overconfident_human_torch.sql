CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_reminders_enabled` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
