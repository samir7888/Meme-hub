"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/images");
        if (!res.ok) throw new Error(await res.text());
        const imageUrls = await res.json();
        setImages(imageUrls);
      } catch (e) {
        console.error("Failed to fetch images:", e);
      }
    };
    fetchImages();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-black text-white">
      <h1 className="text-5xl pt-16  font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <span>Generate memes in </span>

        <span className="text-cyan-300">Seconds</span>
      </h1>
      <p className="text-xl font-semibold text-cyan-600/80 md:text-4xl pb-12">
        without dealing with a messy UI
      </p>

      <Link href={"/admin"}>
        <button className="cursor-pointer mb-8 px-6 py-3 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
          Upload Meme Templates
        </button>
      </Link>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-8 w-full max-w-6xl">
        {images.length > 0 ? (
          images.map((src, index) => (
            <Link href={`/editor/${encodeURIComponent(src)}`} key={index}>
              <div className="relative w-full h-64 bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                <Image
                  src={src}
                  alt={`Meme Template ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 text-xl">
            No meme templates available. Please upload some from the{" "}
            <Link href="/admin" className="text-blue-400 hover:underline">
              admin page
            </Link>
            .
          </p>
        )}
      </section>
    </main>
  );
}
