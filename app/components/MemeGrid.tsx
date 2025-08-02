import { Image as IImage } from "@/types/index";
import MemeGridClient from "./MemeGridClient";

async function fetchImages(search?: string): Promise<IImage[]> {
  try {
    const url = search ? `?search=${search}` : "";
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/image${url}`, {
      cache: "no-store", // Ensure fresh data on each request
    });

    if (!response.ok) {
      throw new Error("Failed to fetch images");
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch images:", error);
    return [];
  }
}

interface MemeGridProps {
  searchParams?: { search?: string };
}

export default async function MemeGrid({ searchParams }: MemeGridProps) {
  const search = searchParams?.search;
  const images = await fetchImages(search);

  return <MemeGridClient images={images} />;
}
