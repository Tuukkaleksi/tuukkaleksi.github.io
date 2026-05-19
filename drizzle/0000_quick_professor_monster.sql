CREATE TABLE "neon_drift_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initials" varchar(4) NOT NULL,
	"score" integer NOT NULL,
	"wave" smallint NOT NULL,
	"round" smallint NOT NULL,
	"time_survived_sec" integer NOT NULL,
	"kills" integer NOT NULL,
	"best_combo" integer NOT NULL,
	"bosses_defeated" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "neon_drift_scores_score_created_idx" ON "neon_drift_scores" USING btree ("score" DESC NULLS LAST,"created_at" DESC NULLS LAST);