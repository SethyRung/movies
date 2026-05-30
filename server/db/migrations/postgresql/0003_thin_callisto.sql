ALTER TABLE "movies" ADD COLUMN "origin" varchar(50);--> statement-breakpoint
ALTER TABLE "tv_series" ADD COLUMN "origin" varchar(50);--> statement-breakpoint
CREATE INDEX "idx_movies_origin" ON "movies" USING btree ("origin");--> statement-breakpoint
CREATE INDEX "idx_tv_series_origin" ON "tv_series" USING btree ("origin");