import { Image as IImage } from "@/types/index";
import MemeGridClient from "./MemeGridClient";
import prisma from "@/lib/db";

async function fetchImages(search?: string): Promise<IImage[]> {
  try {
    const images = await prisma.image.findMany({
      where: {
        title: {
          contains: search || "",
          mode: "insensitive",
        },
      },
    });
    return images;
  } catch (error) {
    console.error("Failed to fetch images:", error);
    return [];
  }
}

interface MemeGridProps {
  searchParams: { search?: string };
}

export default async function MemeGrid({ searchParams }: MemeGridProps) {
  const search = searchParams.search;
  const images = await fetchImages(search);

  return <MemeGridClient images={images} />;
}
