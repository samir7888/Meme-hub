"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Admin() {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const router = useRouter();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    if (preview) {
      URL.revokeObjectURL(preview); // Clean up previous preview
    }
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    try {
      const data = new FormData();
      data.set("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error(await res.text());
      router.push("/");
    } catch (e: any) {
      console.error(e);
      alert("Image upload failed!");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Upload Image Here</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="flex items-center justify-center w-full">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e)}
                  accept="image/*"
                />
              </label>
            )}
          </div>
          <button
            type="submit"
            disabled={!file}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg disabled:bg-gray-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Upload Template
          </button>
        </form>
      </div>
    </main>
  );
}
