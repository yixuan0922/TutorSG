import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";

// Approve and convert job request to job posting (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || session.userType !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const jobRequest = await storage.getJobRequest(params.id);

    if (!jobRequest) {
      return NextResponse.json(
        { message: "Job request not found" },
        { status: 404 }
      );
    }

    if (jobRequest.status !== "Pending") {
      return NextResponse.json(
        { message: "Request already processed" },
        { status: 400 }
      );
    }

    // Create job from request
    const job = await storage.createJob({
      subject: jobRequest.subject,
      level: jobRequest.level,
      rate: jobRequest.budget || "To be discussed",
      location: jobRequest.location,
      schedule: jobRequest.schedule,
      lessonsPerWeek: jobRequest.lessonsPerWeek,
      genderPref: jobRequest.genderPref,
      status: "Open",
    });

    // Update request status to Approved
    await storage.updateJobRequestStatus(params.id, "Approved");

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Approve job request error:", error);
    return NextResponse.json(
      { message: "Failed to approve request" },
      { status: 500 }
    );
  }
}
