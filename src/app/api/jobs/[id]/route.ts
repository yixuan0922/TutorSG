import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";

// Get job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await storage.getJob(params.id);
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { message: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// Update job (admin only)
export async function PATCH(
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

    const body = await request.json();
    const job = await storage.updateJob(params.id, body);
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { message: "Failed to update job" },
      { status: 500 }
    );
  }
}

// Delete job (admin only)
export async function DELETE(
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

    await storage.deleteJob(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { message: "Failed to delete job" },
      { status: 500 }
    );
  }
}
