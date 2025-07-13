import SearchInput from "./components/SearchInput";
import { Suspense } from "react";
import MemeGrid from "./components/MemeGrid";

export default function Home() {
  return (
    <main className="space-y-6 flex min-h-screen flex-col items-center p-8 bg-black text-white">
      <h1 className="text-5xl pt-16 font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <span>Your Meme Templates</span>
      </h1>
      <Suspense fallback={<p className="text-white text-center mt-8">Loading...</p>}>
        <SearchInput />
      </Suspense>
      <Suspense
        fallback={<p className="text-white text-center mt-8">Loading...</p>}
      >
        <MemeGrid />
      </Suspense>
    </main>
  );
}
