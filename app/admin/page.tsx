"use client";
import { useRouter } from "next/navigation";
import React from "react";
import FileUpload from "../components/FileUpload";

export default function Admin() {
  const [videoUploaded, setVideoUploaded] = React.useState<Boolean | null>(
    null
  );

  const handleSuccess = (res: any) => {
    console.log(res);
  };

  return (
    <main className="flex min-h-screen  gap-12 justify-center items-center  p-24 bg-black  text-white">
      <button onClick={() => setVideoUploaded(true)} className=" px-2 py-3 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"> Upload Video</button>
      <button onClick={() => setVideoUploaded(false)} className="  px-2 py-3 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"> Upload Image</button>
      {videoUploaded && (
        <FileUpload onSuccess={handleSuccess} fileType="video" />
      )}

      {videoUploaded === false && (
        <FileUpload onSuccess={handleSuccess} fileType="image" />
      )}
    </main>
  );
}
