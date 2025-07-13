"use client";
import { upload } from "@imagekit/next";
import { Video } from "@imagekit/next";
import { useState } from "react";
import { apiClient } from "./api-client";
import { useRouter } from "next/navigation";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  fileType: "image" | "video";
}

const FileUpload = ({ onSuccess, fileType }: FileUploadProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(""); // New state for thumbnail URL
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFileResponse, setUploadedFileResponse] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Enter a valid video file");
        return false;
      }
    }
    if (fileType === "image") {
      if (!file.type.startsWith("image/")) {
        setError("Enter a valid image file");
        return false;
      }
    }
    if (file.size > 1024 * 1024 * 100) {
      setError("File size should be less than 100MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !validateFile(file)) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));

    const authRes = await fetch("/api/auth/imagekit-auth");
    const auth = await authRes.json();
    setUploading(true);
    const uploadResponse = await upload({
      file,
      fileName: file.name,
      publicKey: process.env.NEXT_PUBLIC_KEY as string,
      expire: auth.authenticationParameters.expire,
      signature: auth.authenticationParameters.signature,
      token: auth.authenticationParameters.token,
      onProgress: (event) => {
        setUploadProgress(Math.round((event.loaded * 100) / event.total));
      },
    });

    setUploadedFileResponse(uploadResponse);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (fileType === "image") {
        await apiClient.createImage({
          title,
          imageUrl: uploadedFileResponse.filePath,
        });
      } else {
        await apiClient.createVideo({
          title,
          description,
          videoUrl: uploadedFileResponse.filePath,
          thumbnailUrl,
        });
      }

      onSuccess(uploadedFileResponse);
      setPreview(null);
      setTitle(""); // Clear fields after successful upload
      setDescription("");
      setThumbnailUrl("");

      router.push("/");
    } catch (error) {
      console.error(error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center">
        Upload {fileType === "image" ? "Image" : "Video"} Here
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {uploadedFileResponse && fileType === "video" && (
          <div className="mt-4">
            <Video
              urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL!}
              src={uploadedFileResponse.filePath}
              width="100%"
              controls={true}
            />
          </div>
        )}

        <div className="flex items-center justify-center w-full">
          {preview && fileType === "image" && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg shadow-md"
            />
          )}

          {!preview && !uploadedFileResponse && (
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">
                  {fileType === "image"
                    ? "SVG, PNG, JPG or GIF"
                    : "MP4, WEBM, OGG"}
                </p>
              </div>
              <input
                id="dropzone-file"
                name="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={fileType === "image" ? "image/*" : "video/*"}
              />
            </label>
          )}
        </div>

        {uploading && uploadProgress > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="text-center text-sm mt-1">
              {uploadProgress}% Uploaded
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {fileType === "video" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
        {fileType === "video" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</label>
            <input
              type="text"
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., https://example.com/thumbnail.jpg"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg disabled:bg-gray-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {"Submit"}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default FileUpload;
