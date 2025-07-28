"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ImageKitProvider } from "@imagekit/next";
import { UserProvider } from "../contexts/UserContext";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL!;

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ImageKitProvider urlEndpoint={urlEndpoint}>
        <UserProvider>{children}</UserProvider>
      </ImageKitProvider>
    </SessionProvider>
  );
};

export default Providers;
