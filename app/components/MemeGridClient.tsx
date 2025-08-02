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
      <p className="text-white text-center mt-8">No Meme Templates Found</p>
    );
  }

  return (
    <section className="flex flex-col items-start gap-6 justify-center">
      <Link href="/admin">
        <button className="relative text-base cursor-pointer px-4 py-2 rounded-lg border border-neutral-600">
          Upload
          <div className="absolute inset-x-0 h-px -bottom-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
        </button>
      </Link>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl">
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
