import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ success: true, message: "Database connection successful!" });
  } catch (error) {
    console.error("Database connection failed:", error);
    // Check if error is an instance of Error to safely access the message property
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ success: false, message: "Database connection failed.", error: errorMessage }, { status: 500 });
  }
}
