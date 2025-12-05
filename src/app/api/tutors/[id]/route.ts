import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";
import { updateTutorSchema } from "@/lib/db/schema";
import { z } from "zod";

// Get tutor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tutor = await storage.getTutor(params.id);
    if (!tutor) {
      return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: _, ...tutorData } = tutor;
    return NextResponse.json(tutorData);
  } catch (error) {
    console.error("Get tutor error:", error);
    return NextResponse.json(
      { message: "Failed to fetch tutor" },
      { status: 500 }
    );
  }
}

// Update tutor profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    // Verify tutor can only update their own profile
    if (
      !session.isLoggedIn ||
      session.userType !== "tutor" ||
      session.userId !== params.id
    ) {
      return NextResponse.json(
        { message: "Forbidden - Can only update your own profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateTutorSchema.parse(body);

    const tutor = await storage.updateTutor(params.id, data);
    if (!tutor) {
      return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: _, ...tutorData } = tutor;
    return NextResponse.json(tutorData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Update tutor error:", error);
    return NextResponse.json(
      { message: "Failed to update tutor" },
      { status: 500 }
    );
  }
}
