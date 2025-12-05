import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    if (session.userType === "tutor") {
      const tutor = await storage.getTutor(session.userId);
      if (!tutor) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      const { password: _, ...tutorData } = tutor;
      return NextResponse.json({ user: tutorData, userType: "tutor" });
    } else if (session.userType === "admin") {
      const admin = await storage.getAdmin(session.userId);
      if (!admin) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      const { password: _, ...adminData } = admin;
      return NextResponse.json({ user: adminData, userType: "admin" });
    }

    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { message: "Failed to get user" },
      { status: 500 }
    );
  }
}
