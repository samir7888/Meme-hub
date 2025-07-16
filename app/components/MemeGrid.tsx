"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { apiClient } from "./api-client";
import { Image } from "@imagekit/react";
import { Image as IImage } from "@/types/index";
import { useSession } from "next-auth/react";

export default function MemeGrid() {
  const { data: session } = useSession();
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
    <section className="flex flex-col items-start gap-6 justify-center">
      {session && (
        <Link href="/admin">
          <button className="bg-pink-600 cursor-pointer hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Upload
          </button>
        </Link>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {images.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 rounded-lg shadow-lg overflow-hidden"
          >
            <Link href={`/editor/${item.imageUrl}`}>
              <div className="relative w-full h-auto cursor-pointer">
                <Image
                  className="object-top aspect-square h-auto"
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
              <h3 className="text-lg text-balance font-bold">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
