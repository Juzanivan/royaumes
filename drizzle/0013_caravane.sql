CREATE SCHEMA "caravan";
--> statement-breakpoint
CREATE TABLE "caravan"."caravans" (
	"caravan_id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"sender_name" text NOT NULL,
	"recipient_id" text NOT NULL,
	"recipient_name" text NOT NULL,
	"cargo" jsonb NOT NULL,
	"escort" text NOT NULL,
	"status" text NOT NULL,
	"sent_at" bigint NOT NULL,
	"departed_at" bigint DEFAULT 0 NOT NULL,
	"arrives_at" bigint DEFAULT 0 NOT NULL,
	"ended_at" bigint
);
--> statement-breakpoint
CREATE TABLE "caravan"."destinations" (
	"player_id" text PRIMARY KEY NOT NULL,
	"village_name" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "caravans_sender_idx" ON "caravan"."caravans" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "caravans_recipient_idx" ON "caravan"."caravans" USING btree ("recipient_id");