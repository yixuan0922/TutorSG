import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";

// Update tutor status (admin only)
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
    const { status } = body;

    if (!["Active", "Pending", "Suspended"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const tutor = await storage.updateTutor(params.id, { status });
    if (!tutor) {
      return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: _, ...tutorData } = tutor;
    return NextResponse.json(tutorData);
  } catch (error) {
    console.error("Update tutor status error:", error);
    return NextResponse.json(
      { message: "Failed to update tutor status" },
      { status: 500 }
    );
  }
}
