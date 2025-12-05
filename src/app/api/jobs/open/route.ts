import { NextResponse } from "next/server";
import { storage } from "@/lib/db/storage";

// Get open jobs only
export async function GET() {
  try {
    const jobs = await storage.getOpenJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Get open jobs error:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
