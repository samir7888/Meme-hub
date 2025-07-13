"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { apiClient } from "./api-client";
import { Image } from "@imagekit/react";
import { Image as IImage } from "@/types/index";

export default function MemeGrid() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const url = search ? `?search=${search}` : "";
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<IImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getImages(url);
        setImages(response as IImage[]);
      } catch (error) {
        console.error("Failed to fetch images:", error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [search, url]);

  if (loading) {
    return <p className="text-white text-center mt-8">Loading...</p>;
  }

  if (!images || images.length === 0) {
    return (
      <p className="text-white text-center mt-8">No Meme Templates Found</p>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
      {images.map((item) => (
        <div
          key={item.id}
          className="bg-gray-900 rounded-lg shadow-lg overflow-hidden"
        >
          <Link href={`/editor/${item.imageUrl}`}>
            <div className="relative w-full h-64 cursor-pointer">
              <Image
                className="object-top aspect-square h-64"
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL!}
                src={item.imageUrl}
                width={500}
                height={300}
                alt={item.title}
                transformation={[{ width: 500, height: 500 }]}
              />
            </div>
          </Link>
          <div className="p-4">
            <h3 className="text-lg font-bold">{item.title}</h3>
          </div>
        </div>
      ))}
    </section>
  );
}