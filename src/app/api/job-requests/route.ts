import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";
import { insertJobRequestSchema } from "@/lib/db/schema";
import { z } from "zod";

// Get all job requests (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || session.userType !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const requests = await storage.getAllJobRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get job requests error:", error);
    return NextResponse.json(
      { message: "Failed to fetch job requests" },
      { status: 500 }
    );
  }
}

// Create job request (public - no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = insertJobRequestSchema.parse(body);
    // Status defaults to "Pending" in the database schema
    const jobRequest = await storage.createJobRequest(data);
    return NextResponse.json(jobRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Create job request error:", error);
    return NextResponse.json(
      { message: "Failed to submit request" },
      { status: 500 }
    );
  }
}
