"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useUser } from "../contexts/UserContext";

const Navbar = () => {
  const { isPremium } = useUser();

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        >
          MEME WAREHOUSE
        </Link>

        {/* todo:add github link */}
        {/* <div className="flex items-center gap-4">
         
          
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
