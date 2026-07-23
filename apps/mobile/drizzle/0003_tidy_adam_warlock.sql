ALTER TABLE `app_settings` ADD `auto_backup_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `app_settings` ADD `last_auto_backup_at` text;