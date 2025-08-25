"use client";
import React from "react";
import FileUpload from "../components/FileUpload";

export default function Admin() {
  const handleSuccess = (res: any) => {
    console.log(res);
  };

  return (
    <main className="flex min-h-screen gap-12 justify-center items-center p-5 lg:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <FileUpload onSuccess={handleSuccess} fileType="image" />
    </main>
  );
}
