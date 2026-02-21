CREATE TABLE `character_memory` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`debate_id` text NOT NULL,
	`working_memory` text NOT NULL,
	`episodic_summary` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`debate_id`) REFERENCES `debates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`years` text NOT NULL,
	`era` text NOT NULL,
	`avatar_url` text,
	`tags` text NOT NULL,
	`key_works` text NOT NULL,
	`core_beliefs` text NOT NULL,
	`rhetorical_style` text NOT NULL,
	`known_positions` text NOT NULL,
	`suggested_opponents` text NOT NULL,
	`suggested_topics` text NOT NULL,
	`sample_quotes` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `debate_turns` (
	`id` text PRIMARY KEY NOT NULL,
	`debate_id` text NOT NULL,
	`character_id` text,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`turn_number` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`debate_id`) REFERENCES `debates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `debates` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`topic` text NOT NULL,
	`format` text NOT NULL,
	`participant_ids` text NOT NULL,
	`user_participating` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
