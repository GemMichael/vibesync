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
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;

        const fetchUserData = async () => {
            try {
                const [userRes, postsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/auth/user/${userId}`),
                    axios.get(`http://localhost:5000/api/posts/user/${userId}`)
                ]);

                setUser(userRes.data);
                setPosts(postsRes.data);
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
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
                <img 
                    src="https://i.pravatar.cc/100" 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-gray-300"
                />
                <div>
                    <h1 className="text-3xl font-bold italic">{user.name}</h1>
                </div>
            </div>

            {/* Posts Section */}
            <div className="flex w-full max-w-6xl mt-8">
                <div className="flex-1 p-4">
                    <h2 className="text-lg font-semibold mb-2">Posts</h2>
                    {posts.length > 0 ? (
                        <div className="mt-6 space-y-4">
                            {posts.map((post) => (
                                <div key={post._id} className="bg-gray-200 shadow-lg rounded-3xl p-4">
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
