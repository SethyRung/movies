CREATE TABLE "watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_type" varchar(10) NOT NULL,
	"content_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "episode_views" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "movie_views" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_watchlist_user_content" ON "watchlist" USING btree ("user_id","content_type","content_id");--> statement-breakpoint
ALTER TABLE "episode_views" ADD CONSTRAINT "episode_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_views" ADD CONSTRAINT "movie_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_episode_views_user" ON "episode_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_movie_views_user" ON "movie_views" USING btree ("user_id");