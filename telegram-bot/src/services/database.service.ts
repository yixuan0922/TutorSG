import { eq, and, inArray, sql as drizzleSql } from 'drizzle-orm';
import { db } from '../db.js';
import { tutors, jobs, applications } from '../../../shared/schema.js';
import type { Tutor, Job, Application } from '../../../shared/schema.js';

export class DatabaseService {
  // Tutor operations
  async getTutorByTelegramId(telegramId: string): Promise<Tutor | null> {
    const result = await db
      .select()
      .from(tutors)
      .where(eq(tutors.telegramId, telegramId))
      .limit(1);

    return result[0] || null;
  }

  async getTutorByEmail(email: string): Promise<Tutor | null> {
    const result = await db
      .select()
      .from(tutors)
      .where(eq(tutors.email, email.toLowerCase()))
      .limit(1);

    return result[0] || null;
  }

  async linkTelegramToTutor(
    tutorId: string,
    telegramId: string,
    telegramUsername?: string
  ): Promise<void> {
    await db
      .update(tutors)
      .set({
        telegramId,
        telegramUsername,
        notificationsEnabled: true,
      })
      .where(eq(tutors.id, tutorId));
  }

  async updateNotificationSettings(
    telegramId: string,
    enabled: boolean
  ): Promise<void> {
    await db
      .update(tutors)
      .set({ notificationsEnabled: enabled })
      .where(eq(tutors.telegramId, telegramId));
  }

  async updateTutorPreferences(
    telegramId: string,
    preferences: {
      subjects?: string[];
      levels?: string[];
      locations?: string[];
      hourlyRates?: { min: number; max: number };
    }
  ): Promise<void> {
    await db
      .update(tutors)
      .set(preferences)
      .where(eq(tutors.telegramId, telegramId));
  }

  // Job operations
  async getOpenJobs(): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, 'Open'))
      .orderBy(drizzleSql`${jobs.createdAt} DESC`);
  }

  async getMatchingJobs(tutor: Tutor): Promise<Job[]> {
    const openJobs = await this.getOpenJobs();

    // Filter jobs based on tutor preferences
    return openJobs.filter(job => {
      // Check if job subject matches tutor's subjects
      const subjectMatch = tutor.subjects.length === 0 ||
        tutor.subjects.some(subject =>
          job.subject.toLowerCase().includes(subject.toLowerCase())
        );

      // Check if job level matches tutor's levels
      const levelMatch = tutor.levels.length === 0 ||
        tutor.levels.some(level =>
          job.level.toLowerCase().includes(level.toLowerCase())
        );

      // Check if job location matches tutor's locations
      const locationMatch = tutor.locations.length === 0 ||
        tutor.locations.some(location =>
          job.location.toLowerCase().includes(location.toLowerCase())
        );

      return subjectMatch && levelMatch && locationMatch;
    });
  }

  async getJobById(jobId: string): Promise<Job | null> {
    const result = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    return result[0] || null;
  }

  async searchJobs(filters: {
    subject?: string;
    level?: string;
    location?: string;
  }): Promise<Job[]> {
    const openJobs = await this.getOpenJobs();

    return openJobs.filter(job => {
      if (filters.subject && !job.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
        return false;
      }
      if (filters.level && !job.level.toLowerCase().includes(filters.level.toLowerCase())) {
        return false;
      }
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  // Application operations
  async createApplication(tutorId: string, jobId: string, message?: string): Promise<Application> {
    const result = await db
      .insert(applications)
      .values({
        tutorId,
        jobId,
        message: message || null,
        status: 'Applied',
      })
      .returning();

    return result[0];
  }

  async hasApplied(tutorId: string, jobId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.tutorId, tutorId),
          eq(applications.jobId, jobId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async getTutorApplications(tutorId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, tutorId))
      .orderBy(drizzleSql`${applications.createdAt} DESC`);
  }

  // Get all tutors with notifications enabled
  async getTutorsWithNotifications(): Promise<Tutor[]> {
    return await db
      .select()
      .from(tutors)
      .where(
        and(
          eq(tutors.notificationsEnabled, true),
          drizzleSql`${tutors.telegramId} IS NOT NULL`
        )
      );
  }

  // Get new jobs (created in last X hours)
  async getRecentJobs(hoursAgo: number = 1): Promise<Job[]> {
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - hoursAgo);

    return await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.status, 'Open'),
          drizzleSql`${jobs.createdAt} >= ${timeThreshold.toISOString()}`
        )
      )
      .orderBy(drizzleSql`${jobs.createdAt} DESC`);
  }
}

export const databaseService = new DatabaseService();
