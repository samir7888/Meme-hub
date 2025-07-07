"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const SearchInput = () => {
  const router = useRouter();

  const pathname = usePathname();
  const searchParam = useSearchParams();
  const [search, setSearch] = React.useState(
    searchParam.get("search")?.trim() || ""
  );
  useEffect(() => {
    const params = new URLSearchParams(searchParam);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [search]);
  return (
    <div className="flex items-center">
      <input
        type="text"
        placeholder="Search"
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mt-2 p-2 rounded-md bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
      />
    </div>
  );
};

export default SearchInput;
