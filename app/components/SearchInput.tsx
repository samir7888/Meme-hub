"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const SearchInput = () => {
  const router = useRouter();

  const pathname = usePathname();
  const searchParam = useSearchParams();
  const [search, setSearch] = React.useState(
    searchParam.get("search")?.trim() || ""
  );
  const debouncedSearch = debounce(search, 700);
  useEffect(() => {
    const params = new URLSearchParams(searchParam);
    if (search) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]);
  return (
    <div className="flex w-xs md:w-md items-center">
      <input
        type="text"
        placeholder="Search"
        onChange={(e) => setSearch(e.target.value)}
        className="w-full flex-1 mt-2 p-2 rounded-md bg-gray-200 dark:bg-neutral-700 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-neutral-200 text-black dark:text-neutral-50 dark:border-neutral-800"
      />
    </div>
  );
};

const debounce = (search: string, wait: number) => {
  const [input, setInput] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setInput(search);
    }, wait);
    return () => clearTimeout(timer);
  }, [search]);
  return input;
};

export default SearchInput;
