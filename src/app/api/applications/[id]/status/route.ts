import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/db/storage";

// Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    const application = await storage.updateApplicationStatus(params.id, status);
    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json(
      { message: "Failed to update application status" },
      { status: 500 }
    );
  }
}
