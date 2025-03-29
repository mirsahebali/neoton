import { relations, sql } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  enabled_2fa: integer({ mode: "boolean" }).default(false),
  hashed_password: text().notNull(),
  created_at: integer({ mode: "timestamp_ms" }),
  is_verified: integer({ mode: "boolean" }).default(false),
});

export const messageTable = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),
  content: text().notNull(),
  sent_at: integer({ mode: "timestamp_ms" }).default(sql`(CURRENT_TIMESTAMP)`),
  sent_by: integer("sender_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  recv_by: integer("recv_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
});

export const messageRelations = relations(messageTable, ({ one }) => ({
  sender: one(usersTable, {
    fields: [messageTable.sent_by],
    references: [usersTable.id],
  }),
  receiver: one(usersTable, {
    fields: [messageTable.recv_by],
    references: [usersTable.id],
  }),
}));

export const groupsTable = sqliteTable("group", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  created_at: integer({ mode: "timestamp_ms" }).default(
    sql`(CURRENT_TIMESTAMP)`,
  ),
  created_by: integer("owner_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
});

export const groupMessage = sqliteTable("group_message", {
  message_id: int().primaryKey({ autoIncrement: true }),
  group_id: integer("group_id").references(() => groupsTable.id, {
    onDelete: "cascade",
  }),
  sent_by: integer("sender_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  content: text().notNull(),
  sent_at: integer({ mode: "timestamp_ms" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const userType = usersTable.$inferSelect;
