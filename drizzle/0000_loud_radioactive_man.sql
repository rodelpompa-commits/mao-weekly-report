CREATE TABLE `weekly_record_history` (
	`version_id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`staff_name` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`actor_role` text NOT NULL,
	`actor_name` text NOT NULL,
	`saved_at` text NOT NULL,
	`sequence` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_weekly_history_record_saved` ON `weekly_record_history` (`record_id`,`saved_at`);--> statement-breakpoint
CREATE INDEX `idx_weekly_history_staff_saved` ON `weekly_record_history` (`staff_name`,`saved_at`);--> statement-breakpoint
CREATE TABLE `weekly_records` (
	`id` text PRIMARY KEY NOT NULL,
	`staff_name` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_weekly_records_staff_updated` ON `weekly_records` (`staff_name`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_weekly_records_deleted` ON `weekly_records` (`deleted_at`);