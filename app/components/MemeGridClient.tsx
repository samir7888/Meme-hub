"use client";
import Link from "next/link";
import { Image } from "@imagekit/react";
import { Image as IImage } from "@/types/index";

interface MemeGridClientProps {
  images: IImage[];
}

export default function MemeGridClient({ images }: MemeGridClientProps) {
  if (!images || images.length === 0) {
    return (
      <p className="text-gray-900 dark:text-white text-center mt-8">
        No Meme Templates Found
      </p>
    );
  }

  return (
    <section className="flex flex-col items-start gap-6 justify-center">
      <Link href="/admin">
        <button className="relative text-base cursor-pointer px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
          Upload
          <div className="absolute inset-x-0 h-px -bottom-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
        </button>
      </Link>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl">
        {images.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
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
              <h3 className="text-lg text-balance font-bold text-gray-900 dark:text-white">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
