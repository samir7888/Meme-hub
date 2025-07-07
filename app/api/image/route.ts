import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Image, { IImage } from "@/models/Image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET(request: NextRequest) {
  await connectToDatabase();
  const url = new URL(request.url);
  const search = url.searchParams.get("search");

  try {
    const images = search
      ? await Image.find({ title: { $regex: search, $options: "i" } })
      : await Image.find({});
    if (!images || images.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
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

    const body: IImage = await request.json();
    if (!body.title || !body.imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const imageData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newImage = await Image.create(imageData);
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
    console.log(imageId, "imageId");
    if (!imageId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
        }
      );
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    await Image.deleteOne({ _id: imageId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting image", error);
    return NextResponse.json(
      { error: "Error deleting image" },
      { status: 500 }
    );
  }
}
