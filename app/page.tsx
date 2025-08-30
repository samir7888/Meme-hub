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
    <main className="space-y-6 flex min-h-screen flex-col items-center p-1 md:p-8 bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="my-16">
        <h1 className="text-3xl tracking-tight leading-tight text-center w-full  md:text-7xl pt-16 font-extrabold mb-5  text-black dark:text-white text-shadow-2xs">
          Create. Laugh. Repeat.
        </h1>
        <p className="text-sm w-full md:text-3xl max-w-3xl mx-auto text-balance text-center mt-10 bg-gradient-to-b from-neutral-800 to-enutral-400 text-transparent bg-clip-text selection:bg-blue-200 selection:text-neutral-500
        dark:from-neutral-50 dark:to-neutral-500">
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
