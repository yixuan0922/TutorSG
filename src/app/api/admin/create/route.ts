import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";
import { insertAdminSchema } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Create admin account (protected - requires existing admin OR no admins exist for initial setup)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    // Check if any admins exist
    const allAdmins = await storage.getAllAdmins();
    const hasAdmins = allAdmins && allAdmins.length > 0;

    // If admins exist, require admin authentication
    if (hasAdmins && (!session.isLoggedIn || session.userType !== "admin")) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = insertAdminSchema.parse(body);

    // Check if admin email already exists
    const existing = await storage.getAdminByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        { message: "Admin email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create admin
    const admin = await storage.createAdmin({
      ...data,
      password: hashedPassword,
    });

    // Remove password from response
    const { password: _, ...adminData } = admin;
    return NextResponse.json(adminData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Create admin error:", error);
    return NextResponse.json(
      { message: "Failed to create admin" },
      { status: 500 }
    );
  }
}
