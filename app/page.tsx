"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { apiClient } from "./components/api-client";
import { IImage } from "@/models/Image";
import { Image } from "@imagekit/react";
import SearchInput from "./components/SearchInput";
import { Suspense } from "react";
interface IVideo {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string; // Made optional
}

export default function Home() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const url = search ? `?search=${search}` : "";
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<IImage[]>([]);
  const fetchImages = async () => {
    setLoading(true);
    const response = await apiClient.getImages(url);
    setImages(response as IImage[]);
    setLoading(false);
  };
  useEffect(() => {
    fetchImages();
  }, [search]);

  if (loading) {
    return <p className="text-white text-center mt-8">Loading...</p>;
  }
  if (!images || images.length === 0) {
    return (
      <p className="text-white text-center mt-8">No Meme Templates Found</p>
    );
  }

  return (
    <main className="space-y-6 flex min-h-screen flex-col items-center p-8 bg-black text-white">
      <h1 className="text-5xl pt-16 font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <span>Your Meme Templates</span>
      </h1>
      <Suspense>
        <SearchInput />
      </Suspense>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {images.map((item) => (
          <div
            key={item.title}
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
                  alt="Picture of the author"
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
    </main>
  );
}
