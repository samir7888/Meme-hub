import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");

  try {
    const images = await prisma.image.findMany({
      where: {
        title: {
          contains: search || "",
          mode: "insensitive",
        },
      },
    });
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.log("Error getting images", error);
    return NextResponse.json(
      { error: "Error getting images" },
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

    const body: { title: string; imageUrl: string } = await request.json();
    if (!body.title || !body.imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const newImage = await prisma.image.create({
      data: {
        title: body.title,
        imageUrl: body.imageUrl,
      },
    });
    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.log("Error creating image", error);
    return NextResponse.json(
      { error: "Error creating image" },
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

    const imageId = request.nextUrl.searchParams.get("id");
    if (!imageId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
        }
      );
    }

    await prisma.image.delete({
      where: {
        id: imageId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting image", error);
    return NextResponse.json(
      { error: "Error deleting image" },
      { status: 500 }
    );
  }
}
