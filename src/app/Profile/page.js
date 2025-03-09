"use client";
import { useState, useEffect } from "react";
import { fetchUserPosts } from "@/app/utils/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
        setLoadingUser(false);

        const getUserPosts = async () => {
          try {
            const userPosts = await fetchUserPosts(storedUser.id);
            setPosts(userPosts);
          } catch (error) {
            console.error("Error fetching posts:", error);
          } finally {
            setLoadingPosts(false);
          }
        };
        getUserPosts();
      } else {
        setLoadingUser(false);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setLoadingUser(false);
    }
  }, []);

  if (loadingUser)
    return (
      <p className="text-center text-lg font-semibold">Loading profile...</p>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 mt-20">
      <div className="flex items-center space-x-4">
        <img
          src="https://i.pravatar.cc/100"
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-gray-300"
        />
        <div>
          <h1 className="text-3xl font-bold italic">{user?.name}</h1>
          <p className="text-gray-600 font-semibold">My Vibes</p>
          <hr className="border-purple-500 mt-1 w-20" />
        </div>
      </div>

      <div className="flex w-full max-w-6xl mt-8">
        <div className="flex-1 p-4">
          <div className="p-6 bg-white shadow-lg rounded-3xl">
            <h2 className="text-lg font-semibold mb-2">My Info</h2>
            <p className="text-gray-600">Name: {user?.name}</p>
            <p className="text-gray-600">Email: {user?.email}</p>
          </div>

          <div className="mt-6 space-y-4">
            {loadingPosts ? (
              <p className="text-center text-gray-500 mt-4">Loading vibes...</p>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gray-200 shadow-lg rounded-3xl p-4"
                >
                  <div className="bg-gray-100 p-4 rounded-xl mt-2">
                    <p className="text-gray-800">{post.text}</p>
                  </div>
                  <div className="flex justify-between mt-3 text-sm font-semibold italic">
                    <span className="cursor-pointer underline">
                      Feel it! ({post.likes.length})
                    </span>
                    <span className="cursor-pointer underline">
                      Add your vibe
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No vibes posted yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
