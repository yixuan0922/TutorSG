import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { 
  insertTutorSchema,
  updateTutorSchema,
  insertJobSchema, 
  insertApplicationSchema,
  insertAdminSchema,
  insertJobRequestSchema,
  insertSalesContactSchema,
  loginSchema,
  type LoginData 
} from "@shared/schema";
import { z } from "zod";

// Auth middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || req.session.userType !== "admin") {
    return res.status(401).json({ message: "Unauthorized - Admin access required" });
  }
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized - Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  
  // Tutor Registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = insertTutorSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getTutorByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Create tutor
      const tutor = await storage.createTutor({
        ...data,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password: _, ...tutorData } = tutor;
      res.status(201).json(tutorData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Tutor Login
  app.post("/api/auth/login/tutor", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const tutor = await storage.getTutorByEmail(data.email);
      if (!tutor) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const validPassword = await bcrypt.compare(data.password, tutor.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = tutor.id;
      req.session.userType = "tutor";
      
      // Remove password from response
      const { password: _, ...tutorData } = tutor;
      res.json(tutorData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Admin Login
  app.post("/api/auth/login/admin", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const admin = await storage.getAdminByEmail(data.email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const validPassword = await bcrypt.compare(data.password, admin.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = admin.id;
      req.session.userType = "admin";
      
      // Remove password from response
      const { password: _, ...adminData } = admin;
      res.json(adminData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  
  // Tutor Routes
  
  // Get all tutors (admin only)
  app.get("/api/tutors", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const tutors = await storage.getAllTutors();
      // Remove passwords from response
      const tutorsData = tutors.map(({ password: _, ...tutor }) => tutor);
      res.json(tutorsData);
    } catch (error) {
      console.error("Get tutors error:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });
  
  // Get tutor by ID
  app.get("/api/tutors/:id", async (req: Request, res: Response) => {
    try {
      const tutor = await storage.getTutor(req.params.id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      // Remove password from response
      const { password: _, ...tutorData } = tutor;
      res.json(tutorData);
    } catch (error) {
      console.error("Get tutor error:", error);
      res.status(500).json({ message: "Failed to fetch tutor" });
    }
  });
  
  // Update tutor profile
  app.patch("/api/tutors/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      // Verify tutor can only update their own profile
      if (req.session.userType !== "tutor" || req.session.userId !== req.params.id) {
        return res.status(403).json({ message: "Forbidden - Can only update your own profile" });
      }
      
      // Validate update data
      const data = updateTutorSchema.parse(req.body);
      
      const tutor = await storage.updateTutor(req.params.id, data);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      // Remove password from response
      const { password: _, ...tutorData } = tutor;
      res.json(tutorData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update tutor error:", error);
      res.status(500).json({ message: "Failed to update tutor" });
    }
  });
  
  // Approve/Suspend tutor (admin only)
  app.patch("/api/tutors/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["Active", "Pending", "Suspended"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const tutor = await storage.updateTutor(req.params.id, { status });
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      // Remove password from response
      const { password: _, ...tutorData } = tutor;
      res.json(tutorData);
    } catch (error) {
      console.error("Update tutor status error:", error);
      res.status(500).json({ message: "Failed to update tutor status" });
    }
  });
  
  // Job Routes
  
  // Get all jobs
  app.get("/api/jobs", async (_req: Request, res: Response) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  
  // Get open jobs only
  app.get("/api/jobs/open", async (_req: Request, res: Response) => {
    try {
      const jobs = await storage.getOpenJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Get open jobs error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  
  // Get job by ID
  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });
  
  // Create job (admin only)
  app.post("/api/jobs", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertJobSchema.parse(req.body);
      const job = await storage.createJob(data);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create job error:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });
  
  // Update job (admin only)
  app.patch("/api/jobs/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const job = await storage.updateJob(req.params.id, req.body);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Update job error:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });
  
  // Delete job (admin only)
  app.delete("/api/jobs/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete job error:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });
  
  // Application Routes
  
  // Get applications by tutor
  app.get("/api/applications/tutor/:tutorId", async (req: Request, res: Response) => {
    try {
      const applications = await storage.getApplicationsByTutor(req.params.tutorId);
      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  
  // Get applications by job
  app.get("/api/applications/job/:jobId", async (req: Request, res: Response) => {
    try {
      const applications = await storage.getApplicationsByJob(req.params.jobId);
      res.json(applications);
    } catch (error) {
      console.error("Get job applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  
  // Create application
  app.post("/api/applications", async (req: Request, res: Response) => {
    try {
      const data = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(data);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create application error:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });
  
  // Update application status
  app.patch("/api/applications/:id/status", async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const application = await storage.updateApplicationStatus(req.params.id, status);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });
  
  // Job Request Routes (Parent Submissions)
  
  // Get all job requests (admin only)
  app.get("/api/job-requests", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const requests = await storage.getAllJobRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get job requests error:", error);
      res.status(500).json({ message: "Failed to fetch job requests" });
    }
  });
  
  // Get pending job requests (admin only)
  app.get("/api/job-requests/pending", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const requests = await storage.getPendingJobRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get pending job requests error:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });
  
  // Create job request (public - no auth required)
  app.post("/api/job-requests", async (req: Request, res: Response) => {
    try {
      const data = insertJobRequestSchema.parse(req.body);
      // Force status to Pending - this is server-controlled, not user input
      const requestData = {
        ...data,
        status: "Pending" as const,
      };
      const request = await storage.createJobRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create job request error:", error);
      res.status(500).json({ message: "Failed to submit request" });
    }
  });
  
  // Update job request status (admin only)
  app.patch("/api/job-requests/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.updateJobRequestStatus(req.params.id, status);
      if (!request) {
        return res.status(404).json({ message: "Job request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Update job request status error:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });
  
  // Approve and convert job request to job posting (admin only)
  app.post("/api/job-requests/:id/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const requestId = req.params.id;
      const request = await storage.getJobRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Job request not found" });
      }
      
      if (request.status !== "Pending") {
        return res.status(400).json({ message: "Request already processed" });
      }
      
      // Create job from request
      const job = await storage.createJob({
        subject: request.subject,
        level: request.level,
        rate: request.budget || "To be discussed",
        location: request.location,
        schedule: request.schedule,
        lessonsPerWeek: request.lessonsPerWeek,
        genderPref: request.genderPref,
        status: "Open",
      });
      
      // Update request status to Approved
      await storage.updateJobRequestStatus(requestId, "Approved");
      
      res.status(201).json(job);
    } catch (error) {
      console.error("Approve job request error:", error);
      res.status(500).json({ message: "Failed to approve request" });
    }
  });
  
  // Delete job request (admin only)
  app.delete("/api/job-requests/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteJobRequest(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete job request error:", error);
      res.status(500).json({ message: "Failed to delete request" });
    }
  });
  
  // Sales Contact Routes
  
  // Create sales contact (public - for "Contact Sales Team" button)
  app.post("/api/sales-contacts", async (req: Request, res: Response) => {
    try {
      const data = insertSalesContactSchema.parse(req.body);
      const contact = await storage.createSalesContact(data);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create sales contact error:", error);
      res.status(500).json({ message: "Failed to submit contact request" });
    }
  });
  
  // Get all sales contacts (admin only)
  app.get("/api/sales-contacts", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const contacts = await storage.getAllSalesContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Get sales contacts error:", error);
      res.status(500).json({ message: "Failed to fetch sales contacts" });
    }
  });
  
  // Update sales contact status (admin only)
  app.patch("/api/sales-contacts/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      await storage.updateSalesContactStatus(req.params.id, status);
      res.json({ message: "Status updated" });
    } catch (error) {
      console.error("Update sales contact status error:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });
  
  // Admin Routes
  
  // Create admin account (protected - requires existing admin OR no admins exist for initial setup)
  app.post("/api/admin/create", async (req: Request, res: Response) => {
    try {
      // Check if any admins exist
      const allAdmins = await storage.getAllAdmins();
      const hasAdmins = allAdmins && allAdmins.length > 0;
      
      // If admins exist, require admin authentication
      if (hasAdmins && (!req.session.userId || req.session.userType !== "admin")) {
        return res.status(401).json({ message: "Unauthorized - Admin access required" });
      }
      
      const data = insertAdminSchema.parse(req.body);
      
      // Check if admin email already exists
      const existing = await storage.getAdminByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "Admin email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Create admin
      const admin = await storage.createAdmin({
        ...data,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password: _, ...adminData } = admin;
      res.status(201).json(adminData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create admin error:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
