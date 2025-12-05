import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/db/storage";
import { loginSchema } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const admin = await storage.getAdminByEmail(data.email);
    if (!admin) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(data.password, admin.password);
    if (!validPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Set session
    const session = await getSession();
    session.userId = admin.id;
    session.userType = "admin";
    session.isLoggedIn = true;
    await session.save();

    // Remove password from response
    const { password: _, ...adminData } = admin;
    return NextResponse.json(adminData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Admin login error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
