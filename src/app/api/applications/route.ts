import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/db/storage";
import { insertApplicationSchema } from "@/lib/db/schema";
import { z } from "zod";

// Create application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = insertApplicationSchema.parse(body);
    const application = await storage.createApplication(data);
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Create application error:", error);
    return NextResponse.json(
      { message: "Failed to create application" },
      { status: 500 }
    );
  }
}
