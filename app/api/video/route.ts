import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
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

    const body: {
      title: string;
      description: string;
      videoUrl: string;
      thumbnailUrl?: string;
      controls?: boolean;
      width?: number;
      height?: number;
      quality?: number;
    } = await request.json();
    if (!body.title || !body.description || !body.videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const newVideo = await prisma.video.create({
      data: {
        title: body.title,
        description: body.description,
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl,
        controls: body.controls,
        width: body.width,
        height: body.height,
        quality: body.quality,
      },
    });
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

    await prisma.video.delete({
      where: {
        id: videoId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting video", error);
    return NextResponse.json(
      { error: "Error deleting video" },
      { status: 500 }
    );
  }
}

