CREATE TABLE `heart_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('admin_grant','purchase','use_chat','use_report','use_photo','refund') NOT NULL,
	`description` text,
	`adminId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `heart_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_hearts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_hearts_id` PRIMARY KEY(`id`)
);
