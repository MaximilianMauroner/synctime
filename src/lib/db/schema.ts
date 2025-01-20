import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const clients = sqliteTable("clients", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
});

export const applications = sqliteTable("applications", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
});

export const applicationTimeRanges = sqliteTable("application_time_ranges", {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
        .notNull()
        .references(() => applications.id),
    startTime: integer("start_time").notNull(),
    endTime: integer("end_time").notNull(),
});

export const titles = sqliteTable("titles", {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
        .notNull()
        .references(() => applications.id),
    title: text("title").notNull(),
});

export const titleTimeRanges = sqliteTable("title_time_ranges", {
    id: text("id").primaryKey(),
    titleId: text("title_id")
        .notNull()
        .references(() => titles.id),
    startTime: integer("start_time").notNull(),
    endTime: integer("end_time").notNull(),
});

