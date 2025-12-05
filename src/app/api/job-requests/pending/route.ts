import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";

// Get pending job requests (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || session.userType !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const requests = await storage.getPendingJobRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get pending job requests error:", error);
    return NextResponse.json(
      { message: "Failed to fetch pending requests" },
      { status: 500 }
    );
  }
}
