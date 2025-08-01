import SearchInput from "./components/SearchInput";
import { Suspense } from "react";
import MemeGrid from "./components/MemeGrid";

export default function Home() {
  return (
    <main className="space-y-6 flex min-h-screen flex-col items-center p-8 bg-neutral-800 text-white">
      <div className="my-40">
        <h1 className="text-2xl tracking-tight leading-tight text-center w-full  md:text-7xl pt-16 font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r  from-purple-400 to-pink-600">
          Create. Laugh. Repeat.
        </h1>
        <p className="text-xl md:text-3xl max-w-3xl mx-auto text-balance text-center mt-10 bg-gradient-to-b from-purple-300 to-pink-500 text-transparent bg-clip-text selection:bg-white selection:text-neutral-500">
          Choose from viral templates or upload your own. Craft memes that break
          the internet – in seconds!
        </p>
      </div>

      <Suspense
        fallback={<p className="text-white text-center mt-8">Loading...</p>}
      >
        <SearchInput />
        <MemeGrid />
      </Suspense>
    </main>
  );
}
