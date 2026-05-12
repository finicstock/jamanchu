CREATE TABLE `safety_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterUserId` int NOT NULL,
	`targetUserId` int NOT NULL,
	`chatId` int,
	`action` enum('report','block','withdraw_consent') NOT NULL,
	`reason` varchar(120),
	`note` text,
	`status` enum('open','reviewed','resolved') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `safety_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `safety_actions_reporter_idx` ON `safety_actions` (`reporterUserId`);--> statement-breakpoint
CREATE INDEX `safety_actions_target_idx` ON `safety_actions` (`targetUserId`);