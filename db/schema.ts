import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const weeklyRecords = sqliteTable("weekly_records", {
  id: text("id").primaryKey(),
  staffName: text("staff_name").notNull(),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  index("idx_weekly_records_staff_updated").on(table.staffName, table.updatedAt),
  index("idx_weekly_records_deleted").on(table.deletedAt),
]);

export const weeklyRecordHistory = sqliteTable("weekly_record_history", {
  versionId: text("version_id").primaryKey(),
  recordId: text("record_id").notNull(),
  staffName: text("staff_name").notNull(),
  operation: text("operation").notNull(),
  payload: text("payload").notNull(),
  actorRole: text("actor_role").notNull(),
  actorName: text("actor_name").notNull(),
  savedAt: text("saved_at").notNull(),
  sequence: integer("sequence").notNull(),
}, (table) => [
  index("idx_weekly_history_record_saved").on(table.recordId, table.savedAt),
  index("idx_weekly_history_staff_saved").on(table.staffName, table.savedAt),
]);
