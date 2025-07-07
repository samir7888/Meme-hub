"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ImageKitProvider } from "@imagekit/next";
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL!;
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ImageKitProvider urlEndpoint={urlEndpoint}>{children}</ImageKitProvider>
    </SessionProvider>
  );
};

export default Providers;
