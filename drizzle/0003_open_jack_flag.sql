CREATE TABLE `chemistry_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chatId` int NOT NULL,
	`userAId` int NOT NULL,
	`userBId` int NOT NULL,
	`overallScore` int NOT NULL,
	`scores` json,
	`highlights` json,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chemistry_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clone_chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userAId` int NOT NULL,
	`userBId` int NOT NULL,
	`status` enum('in_progress','completed','failed') NOT NULL DEFAULT 'in_progress',
	`messages` json,
	`totalMessages` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `clone_chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clone_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nickname` varchar(50) NOT NULL,
	`gender` enum('male','female','other') NOT NULL,
	`interestedIn` enum('male','female','both') NOT NULL,
	`age` int NOT NULL,
	`personality` json,
	`interests` json,
	`values` text,
	`lifestyle` text,
	`status` enum('active','paused','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clone_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `clone_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('match_found','report_ready','heart_received','chat_request','system') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
