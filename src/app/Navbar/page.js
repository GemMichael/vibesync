"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, Home, User, LogOut } from "lucide-react";
import debounce from "lodash.debounce";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const router = useRouter();

  const fetchSearchResults = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    try {
      const response = await axios.get(
       `${process.env.NEXT_PUBLIC_API_URL}/api/auth/search?query=${searchQuery}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
      setResults([]);
    }
  };

  const debouncedSearch = useCallback(debounce(fetchSearchResults, 500), []);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/Login");
  };

  return (
    <nav className="fixed top-0 z-50 w-full px-6 xl:px-0 bg-white shadow-md">
      <div className="flex items-center justify-between max-w-[1160px] w-full py-5 mx-auto">
        <div className="flex items-center ml-10">
          <img src="/images/V.png" alt="Logo" className="w-10 h-10" />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <Search className="absolute right-2 top-2 w-6 h-6 cursor-pointer" />

          {results.length > 0 && (
            <ul className="absolute bg-white border rounded-lg mt-2 w-full shadow-lg">
              {results.map((user) => (
                <li
                  key={user._id}
                  onClick={() => router.push(`/Profile/${user._id}`)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-8 text-black">
          <Home
            className="w-6 h-6 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <User
            className="w-6 h-6 cursor-pointer"
            onClick={() => router.push("/Profile")}
          />
          <LogOut
            className="w-6 h-6 mr-5 cursor-pointer text-red-500 hover:text-red-700 transition"
            onClick={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
}
