import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, json, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tutors table
export const tutors = pgTable("tutors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  mobile: text("mobile"),
  gender: text("gender"),
  nationality: text("nationality"),
  education: text("education"),
  qualification: text("qualification"),
  subjects: text("subjects").array().notNull().default(sql`ARRAY[]::text[]`),
  levels: text("levels").array().notNull().default(sql`ARRAY[]::text[]`),
  hourlyRates: json("hourly_rates").$type<{ min: number; max: number }>(),
  experienceYears: integer("experience_years"),
  specialNeeds: boolean("special_needs").notNull().default(false),
  languages: text("languages").array().notNull().default(sql`ARRAY[]::text[]`),
  certifications: text("certifications"),
  status: text("status").notNull().default("Pending"),
  publicProfile: boolean("public_profile").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  rate: text("rate").notNull(),
  location: text("location").notNull(),
  genderPref: text("gender_pref"),
  schedule: text("schedule"),
  lessonsPerWeek: integer("lessons_per_week"),
  mapUrl: text("map_url"),
  status: text("status").notNull().default("Open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id").notNull().references(() => tutors.id),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  status: text("status").notNull().default("Applied"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admins table
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const tutorsRelations = relations(tutors, ({ many }) => ({
  applications: many(applications),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  tutor: one(tutors, {
    fields: [applications.tutorId],
    references: [tutors.id],
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));

// Insert schemas
export const insertTutorSchema = createInsertSchema(tutors, {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().optional(),
  subjects: z.array(z.string()).default([]),
  levels: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
}).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs, {
  subject: z.string().min(1, "Subject is required"),
  level: z.string().min(1, "Level is required"),
  rate: z.string().min(1, "Rate is required"),
  location: z.string().min(1, "Location is required"),
}).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins, {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
}).omit({
  id: true,
  createdAt: true,
});

// Login schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type Tutor = typeof tutors.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;

// Application with relations type
export type ApplicationWithRelations = Application & {
  tutor: Tutor;
  job: Job;
};
