CREATE TABLE "ranking"."caravan_senders" (
	"caravan_id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ranking"."players" ADD COLUMN "caravans" integer DEFAULT 0 NOT NULL;