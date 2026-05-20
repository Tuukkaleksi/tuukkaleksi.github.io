import { index, integer, pgTable, smallint, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "@/db/auth-schema";

import { account, accountRelations, session, sessionRelations, user, userRelations, verification } from "@/db/auth-schema";

export const neonDriftScores = pgTable(
  "neon_drift_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    initials: varchar("initials", { length: 4 }).notNull(),
    score: integer("score").notNull(),
    wave: smallint("wave").notNull(),
    round: smallint("round").notNull(),
    timeSurvivedSec: integer("time_survived_sec").notNull(),
    kills: integer("kills").notNull(),
    bestCombo: integer("best_combo").notNull(),
    bossesDefeated: integer("bosses_defeated").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("neon_drift_scores_score_created_idx").on(table.score.desc(), table.createdAt.desc()),
  ],
);

export type NeonDriftScore = typeof neonDriftScores.$inferSelect;
export type NewNeonDriftScore = typeof neonDriftScores.$inferInsert;

export const authSchema = {
  user,
  session,
  account,
  verification,
  userRelations,
  sessionRelations,
  accountRelations,
};
