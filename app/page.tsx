"use client";
import { IKVideo } from "imagekitio-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { apiClient } from "./components/api-client";
import { IImage } from "@/models/Image";
import { Image } from "@imagekit/react";

interface IVideo {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string; // Made optional
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const fetchCollections = async () => {
    setLoading(true);
    const videos = (await apiClient.getVideos()) as IVideo[];
    const images = (await apiClient.getImages()) as IImage[];
    setCollections([...videos, ...images]);
    setLoading(false);
  };
  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (id: string, type: 'image' | 'video') => {
    try {
      if (type === 'image') {
        await apiClient.deleteImage(id);
      } else {
        await apiClient.deleteVideo(id);
      }
      fetchCollections(); // Refresh the list after deletion
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };
  if (loading) {
    return <p className="text-white text-center mt-8">Loading...</p>;
  }
  if (collections.length === 0) {
    return (
      <p className="text-white text-center mt-8">No Meme Templates Found</p>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-black text-white">
      <h1 className="text-5xl pt-16 font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <span>Your Meme Templates</span>
      </h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {collections.map((item) => (
          <div
            key={item._id}
            className="bg-gray-900 rounded-lg shadow-lg overflow-hidden"
          >
            <Link href={`/editor/${item.imageUrl ? item.imageUrl : item.videoUrl}`}>
              <div className="relative w-full h-64 cursor-pointer">
                {item.videoUrl ? (
                  <IKVideo
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL!}
                    path={item.videoUrl}
                    width="100%"
                    height="100%"
                    controls={false}
                    className="object-cover"
                    poster={item.thumbnailUrl || undefined}
                  />
                ) : (
                  <Image
                  className="object-top aspect-square h-64"
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL!}
                    src={item.imageUrl}
                    width={500}
                    height={300}
                    alt="Picture of the author"
                    transformation={[{ width: 500, height: 500 }]}
                  />
                )}
              </div>
            </Link>
            <div className="p-4">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <button
                onClick={() => handleDelete(item._id, 'videoUrl' in item ? 'video' : 'image')}
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
