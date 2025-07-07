import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const { title, description, videoUrl, thumbnailUrl } = data;

    if (!title || !description || !videoUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newVideo = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl, // This can be undefined
    });

    await newVideo.save();

    return NextResponse.json({ success: true, video: newVideo });
  } catch (error) {
    console.error("Error saving video to database:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}