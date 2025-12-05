import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storage } from "@/lib/db/storage";
import { insertSalesContactSchema } from "@/lib/db/schema";
import { z } from "zod";

// Get all sales contacts (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || session.userType !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const contacts = await storage.getAllSalesContacts();
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Get sales contacts error:", error);
    return NextResponse.json(
      { message: "Failed to fetch sales contacts" },
      { status: 500 }
    );
  }
}

// Create sales contact (public - for "Contact Sales Team" button)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = insertSalesContactSchema.parse(body);
    const contact = await storage.createSalesContact(data);
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Create sales contact error:", error);
    return NextResponse.json(
      { message: "Failed to submit contact request" },
      { status: 500 }
    );
  }
}
