import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";

// Get all tutors (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || session.userType !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const tutors = await storage.getAllTutors();
    // Remove passwords from response
    const tutorsData = tutors.map(({ password: _, ...tutor }) => tutor);
    return NextResponse.json(tutorsData);
  } catch (error) {
    console.error("Get tutors error:", error);
    return NextResponse.json(
      { message: "Failed to fetch tutors" },
      { status: 500 }
    );
  }
}
