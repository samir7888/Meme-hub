import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  try {
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean();
    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.log("Error getting videos", error);
    return NextResponse.json(
      { error: "Error getting videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: IVideo = await request.json();
    if (
      !body.title ||
      !body.description ||
      !body.videoUrl 
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const videoData = {
      ...body,
      controls: body?.controls ?? true, 
      transformation: {
        width: body.transformation?.width || 1080,
        height: body.transformation?.height || 1920,
        quality: body.transformation?.quality || 100,
      },
    };
    const newVideo = await Video.create(videoData);
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.log("Error creating video", error);
    return NextResponse.json(
      { error: "Error creating video" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = request.nextUrl.searchParams.get("id");
    if (!videoId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
        }
      );
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    await Video.deleteOne({ _id: videoId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting video", error);
    return NextResponse.json(
      { error: "Error deleting video" },
      { status: 500 }
    );
  }
}
