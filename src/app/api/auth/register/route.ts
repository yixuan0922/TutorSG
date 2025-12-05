import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/db/storage";
import { insertTutorSchema } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = insertTutorSchema.parse(body);

    // Check if email already exists
    const existing = await storage.getTutorByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create tutor
    const tutor = await storage.createTutor({
      ...data,
      password: hashedPassword,
    });

    // Remove password from response
    const { password: _, ...tutorData } = tutor;
    return NextResponse.json(tutorData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
