import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/db/storage";

// Get applications by tutor
export async function GET(
  request: NextRequest,
  { params }: { params: { tutorId: string } }
) {
  try {
    const applications = await storage.getApplicationsByTutor(params.tutorId);
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
