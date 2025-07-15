import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ success: true, message: "Server is working" });
  } catch (error) {
    console.error("Database connection failed:", error);
    // Check if error is an instance of Error to safely access the message property
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ success: false, message: "Database connection failed.", error: errorMessage }, { status: 500 });
  }
}
