"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function ProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("User data received:", user);
    console.log("Friends list:", user?.friends);
    console.log(
      "Logged-in user ID:",
      JSON.parse(localStorage.getItem("user"))?.id
    );
  }, [user]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (!loggedInUser) {
          router.push("/Login");
          return;
        }

        const [userRes, postsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/auth/user/${userId}`),
          axios.get(`http://localhost:5000/api/posts/user/${userId}`),
        ]);

        setUser(userRes.data);
        setPosts(postsRes.data);

        setIsFriend(userRes.data.friends?.includes(loggedInUser.id));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("User not found");
        setTimeout(() => router.push("/404"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleAddFriend = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You need to be logged in to add a friend.");

      const response = await axios.post(
        `http://localhost:5000/api/auth/add-friend/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message);
      setIsFriend(true);
    } catch (error) {
      console.error(
        "Error adding friend:",
        error.response?.data || error.message
      );
      alert("Failed to add friend.");
    }
  };

  const handleUnfriend = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You need to be logged in to unfriend.");

      const response = await axios.post(
        `http://localhost:5000/api/auth/unfriend/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message);
      setIsFriend(false);
      setUser((prevUser) => ({
        ...prevUser,
        friends: prevUser.friends.filter((f) => f._id !== userId),
      }));
    } catch (error) {
      console.error(
        "Error unfriending:",
        error.response?.data || error.message
      );
      alert("Failed to unfriend.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (!loggedInUser) {
          router.push("/Login");
          return;
        }

        const userRes = await axios.get(
          `http://localhost:5000/api/auth/user/${userId}`
        );
        setUser(userRes.data);

        setIsFriend(
          userRes.data.friends?.some((friend) => friend._id === loggedInUser.id)
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("User not found");
        setTimeout(() => router.push("/404"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 mt-20">
      <div className="flex items-center space-x-4">
        s
        <div>
          <h1 className="text-3xl font-bold italic">{user.name}</h1>
        </div>
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={() => router.push(`/messages/${userId}`)}
      >
        Message
      </button>

      <button
        onClick={isFriend ? handleUnfriend : handleAddFriend}
        className={`mt-4 px-6 py-2 text-white font-bold rounded-lg transition ${
          isFriend
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isFriend ? "Unfriend" : "Add Pal"}
      </button>

      <div className="flex w-full max-w-6xl mt-8">
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold mb-2">Posts</h2>
          {posts.length > 0 ? (
            <div className="mt-6 space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gray-200 shadow-lg rounded-3xl p-4"
                >
                  <p className="text-gray-800">{post.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
