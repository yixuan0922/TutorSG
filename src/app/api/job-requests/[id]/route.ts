import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";

// Delete job request (admin only)
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

    await storage.deleteJobRequest(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete job request error:", error);
    return NextResponse.json(
      { message: "Failed to delete request" },
      { status: 500 }
    );
  }
}
