import SearchInput from "./components/SearchInput";
import { Suspense } from "react";
import MemeGrid from "./components/MemeGrid";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <main className="space-y-6 flex min-h-screen flex-col items-center p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="my-16">
        <h1 className="text-2xl tracking-tight leading-tight text-center w-full  md:text-7xl pt-16 font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r  from-purple-400 to-pink-600">
          Create. Laugh. Repeat.
        </h1>
        <p className="text-xl md:text-3xl max-w-3xl mx-auto text-balance text-center mt-10 bg-gradient-to-b from-purple-300 to-pink-500 text-transparent bg-clip-text selection:bg-white selection:text-neutral-500">
          Choose from viral templates or upload your own. Craft memes that break
          the internet – in seconds!
        </p>
      </div>

      <SearchInput />
      <Suspense
        fallback={
          <p className="text-gray-900 dark:text-white text-center mt-8">
            Loading...
          </p>
        }
      >
        <MemeGrid searchParams={resolvedSearchParams} />
      </Suspense>
    </main>
  );
}
