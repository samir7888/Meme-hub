'use client'
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Meme HUB
        </Link>
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <p>Welcome, {session.user?.email}</p>
              <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Logout
              </button>
              <Link href="/admin">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                  Upload
                </button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
