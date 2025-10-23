// Storage interface and database implementation using javascript_database blueprint
import { 
  tutors, 
  jobs, 
  applications, 
  admins,
  jobRequests,
  salesContacts,
  type Tutor, 
  type InsertTutor,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type Admin,
  type InsertAdmin,
  type JobRequest,
  type InsertJobRequest,
  type SalesContact,
  type InsertSalesContact,
  type ApplicationWithRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Tutor operations
  getTutor(id: string): Promise<Tutor | undefined>;
  getTutorByEmail(email: string): Promise<Tutor | undefined>;
  createTutor(tutor: InsertTutor): Promise<Tutor>;
  updateTutor(id: string, data: Partial<Tutor>): Promise<Tutor | undefined>;
  getAllTutors(): Promise<Tutor[]>;
  
  // Job operations
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getOpenJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, data: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<void>;
  
  // Application operations
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByTutor(tutorId: string): Promise<ApplicationWithRelations[]>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application | undefined>;
  
  // Admin operations
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAllAdmins(): Promise<Admin[]>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Job Request operations
  getJobRequest(id: string): Promise<JobRequest | undefined>;
  getAllJobRequests(): Promise<JobRequest[]>;
  getPendingJobRequests(): Promise<JobRequest[]>;
  createJobRequest(request: InsertJobRequest): Promise<JobRequest>;
  updateJobRequestStatus(id: string, status: string): Promise<JobRequest | undefined>;
  deleteJobRequest(id: string): Promise<void>;
  
  // Sales Contact operations
  createSalesContact(contact: InsertSalesContact): Promise<SalesContact>;
  getAllSalesContacts(): Promise<SalesContact[]>;
  updateSalesContactStatus(id: string, status: string): Promise<SalesContact | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Tutor operations
  async getTutor(id: string): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.id, id));
    return tutor || undefined;
  }

  async getTutorByEmail(email: string): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.email, email));
    return tutor || undefined;
  }

  async createTutor(insertTutor: InsertTutor): Promise<Tutor> {
    const [tutor] = await db
      .insert(tutors)
      .values(insertTutor)
      .returning();
    return tutor;
  }

  async updateTutor(id: string, data: Partial<Tutor>): Promise<Tutor | undefined> {
    const [tutor] = await db
      .update(tutors)
      .set(data)
      .where(eq(tutors.id, id))
      .returning();
    return tutor || undefined;
  }

  async getAllTutors(): Promise<Tutor[]> {
    return await db.select().from(tutors).orderBy(desc(tutors.createdAt));
  }

  // Job operations
  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getOpenJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.status, "Open")).orderBy(desc(jobs.createdAt));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async updateJob(id: string, data: Partial<Job>): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set(data)
      .where(eq(jobs.id, id))
      .returning();
    return job || undefined;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Application operations
  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationsByTutor(tutorId: string): Promise<ApplicationWithRelations[]> {
    const result = await db.query.applications.findMany({
      where: eq(applications.tutorId, tutorId),
      with: {
        tutor: true,
        job: true,
      },
      orderBy: desc(applications.createdAt),
    });
    return result as ApplicationWithRelations[];
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  // Admin operations
  async getAdmin(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return await db.select().from(admins);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  // Job Request operations
  async getJobRequest(id: string): Promise<JobRequest | undefined> {
    const [request] = await db.select().from(jobRequests).where(eq(jobRequests.id, id));
    return request || undefined;
  }

  async getAllJobRequests(): Promise<JobRequest[]> {
    return await db.select().from(jobRequests).orderBy(desc(jobRequests.createdAt));
  }

  async getPendingJobRequests(): Promise<JobRequest[]> {
    return await db.select().from(jobRequests).where(eq(jobRequests.status, "Pending")).orderBy(desc(jobRequests.createdAt));
  }

  async createJobRequest(insertJobRequest: InsertJobRequest): Promise<JobRequest> {
    // Force status to Pending at storage layer - defense in depth
    const [request] = await db
      .insert(jobRequests)
      .values({
        ...insertJobRequest,
        status: "Pending",
      })
      .returning();
    return request;
  }

  async updateJobRequestStatus(id: string, status: string): Promise<JobRequest | undefined> {
    const [request] = await db
      .update(jobRequests)
      .set({ status })
      .where(eq(jobRequests.id, id))
      .returning();
    return request || undefined;
  }

  async deleteJobRequest(id: string): Promise<void> {
    await db.delete(jobRequests).where(eq(jobRequests.id, id));
  }

  // Sales Contact operations
  async createSalesContact(insertSalesContact: InsertSalesContact): Promise<SalesContact> {
    // Force status to "New" at storage layer - defense in depth
    const [contact] = await db
      .insert(salesContacts)
      .values({
        ...insertSalesContact,
        status: "New",
      })
      .returning();
    return contact;
  }

  async getAllSalesContacts(): Promise<SalesContact[]> {
    return await db.select().from(salesContacts).orderBy(desc(salesContacts.createdAt));
  }

  async updateSalesContactStatus(id: string, status: string): Promise<SalesContact | undefined> {
    const [contact] = await db
      .update(salesContacts)
      .set({ status })
      .where(eq(salesContacts.id, id))
      .returning();
    return contact || undefined;
  }
}

export const storage = new DatabaseStorage();
