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
  mobile: text("mobile").notNull(),
  
  // Personal Information (Step 1)
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  age: integer("age"),
  nationality: text("nationality"),
  race: text("race"),
  nricLast4: text("nric_last_4"),
  
  // Tutoring Preferences (Step 2)
  subjects: text("subjects").array().notNull().default(sql`ARRAY[]::text[]`),
  levels: text("levels").array().notNull().default(sql`ARRAY[]::text[]`),
  locations: text("locations").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Qualifications & Experience (Step 3)
  tutorType: text("tutor_type"),
  experienceYears: integer("experience_years"),
  education: text("education"),
  qualification: text("qualification"),
  
  // Profile (Step 4)
  introduction: text("introduction"),
  teachingExperience: text("teaching_experience"),
  studentResults: text("student_results"),
  otherInfo: text("other_info"),
  
  // Additional fields
  hourlyRates: json("hourly_rates").$type<{ min: number; max: number }>(),
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

// Job Requests table (parent submissions)
export const jobRequests = pgTable("job_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentName: text("parent_name").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone").notNull(),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  location: text("location").notNull(),
  schedule: text("schedule"),
  budget: text("budget"),
  lessonsPerWeek: integer("lessons_per_week"),
  genderPref: text("gender_pref"),
  additionalNotes: text("additional_notes"),
  status: text("status").notNull().default("Pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sales Contacts table (direct sales inquiries)
export const salesContacts = pgTable("sales_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  message: text("message"),
  status: text("status").notNull().default("New"),
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
  mobile: z.string().min(1, "Mobile number is required"),
  subjects: z.array(z.string()).default([]),
  levels: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
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

export const insertJobRequestSchema = createInsertSchema(jobRequests, {
  parentName: z.string().min(2, "Name is required"),
  contactPhone: z.string().min(8, "Valid phone number is required"),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  subject: z.string().min(1, "Subject is required"),
  level: z.string().min(1, "Level is required"),
  location: z.string().min(1, "Location is required"),
}).omit({
  id: true,
  createdAt: true,
  status: true,  // Status is server-controlled, not user input
});

export const insertSalesContactSchema = createInsertSchema(salesContacts, {
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
}).omit({
  id: true,
  createdAt: true,
  status: true,  // Status is server-controlled
});

// Update tutor schema (editable fields only)
export const updateTutorSchema = createInsertSchema(tutors, {
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().min(1, "Mobile number is required"),
  subjects: z.array(z.string()).default([]),
  levels: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
}).omit({
  id: true,
  email: true,  // Requires separate verification flow
  password: true,  // Requires separate security flow
  status: true,  // Admin-controlled
  createdAt: true,
  publicProfile: true,  // Can add later if needed
}).partial();  // All fields optional for updates

// Login schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type UpdateTutor = z.infer<typeof updateTutorSchema>;
export type Tutor = typeof tutors.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export type InsertJobRequest = z.infer<typeof insertJobRequestSchema>;
export type JobRequest = typeof jobRequests.$inferSelect;

export type InsertSalesContact = z.infer<typeof insertSalesContactSchema>;
export type SalesContact = typeof salesContacts.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;

// Application with relations type
export type ApplicationWithRelations = Application & {
  tutor: Tutor;
  job: Job;
};
