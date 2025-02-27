"use client";
import { useState, useEffect } from "react";
import { fetchPosts, createPost, likePost, addComment, deletePost, deleteComment, fetchRandomUsers } from "@/app/utils/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [showInput, setShowInput] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const handleUserClick = (userId) => {
    router.push(`/Profile/${userId}`);
  };
  const router = useRouter();


  useEffect(() => {
    const getSuggestedUsers = async () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) return; 
        const users = await fetchRandomUsers(storedUser.id); 
        setSuggestedUsers(users);
    };
    getSuggestedUsers();
}, []);



  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.replace("/Login");
    } else {
      setUser(JSON.parse(userData));
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    if (!isLoading) {
      const getPosts = async () => {
        const data = await fetchPosts();
        setPosts(data);
      };
      getPosts();
    }
  }, [isLoading]);


  if (isLoading) return null;


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to post.");
      return;
    }

    const newPost = await createPost(message, token);
    if (newPost) {
      setPosts([newPost, ...posts]);
      setMessage("");
    }
  };

  
  const handleLike = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to like posts.");
      return;
    }

    const updatedPost = await likePost(id, token);
    if (updatedPost) {
      setPosts(posts.map(post => post._id === id ? updatedPost : post));
    }
  };

  
  const handleAddComment = async (id) => {
    if (!newComments[id]?.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to comment.");
      return;
    }

    const updatedPost = await addComment(id, newComments[id], token);
    if (updatedPost) {
      setPosts(posts.map(post => post._id === id ? updatedPost : post));
      setNewComments({ ...newComments, [id]: "" });
      setShowInput({ ...showInput, [id]: false });
    }
  };

  
  const handleDeletePost = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const success = await deletePost(id);
    if (success) {
      setPosts(posts.filter(post => post._id !== id));
    }
  };


  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const updatedPost = await deleteComment(postId, commentId);

    if (updatedPost) {
      console.log("✅ Updating UI after comment deletion");
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, comments: updatedPost.comments } : post
        )
      );
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-10 mt-20">
      {/* Left Sidebar - Suggested Vibe Pals */}
      <div className="w-[250px] bg-gray-200 shadow-lg rounded-3xl p-4 h-fit">
        <h2 className="font-bold text-lg mb-4">Suggested Vibe Pals</h2>
        <ul className="space-y-3">
          {suggestedUsers.map((pal) => (
            <li
              key={pal._id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-300 p-2 rounded-lg"
              onClick={() => router.push(`/Profile/${pal._id}`)} 
            >
              <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-8 h-8 rounded-full" />
              <span className="font-semibold">{pal.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content - Posts & Form */}
      <div className="w-[650px] mx-10 h-screen overflow-y-auto scrollbar-hide">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-3xl p-6 flex flex-col items-center relative">
          <p className="text-lg font-medium mb-3">Got a vibe? Let's hear it. 🌐</p>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message...."
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500"
          />
          <button
            type="submit"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-purple-600 text-white text-sm font-medium py-2 px-6 rounded-full"
          >
            Drop it!
          </button>
        </form>

        {/* Posts Section */}
        <div className="mt-10 space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-gray-200 shadow-lg rounded-3xl p-4">

              {/* User Info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img src="https://i.pravatar.cc/40" alt="User Avatar" className="w-10 h-10 rounded-full" />
                  <p className="font-bold italic">{post.userName}</p>
                </div>
                {user?.id === post.user && (
                  <button onClick={() => handleDeletePost(post._id)} className="text-red-500">❌</button>
                )}
              </div>

              {/* Message Content */}
              <div className="bg-gray-100 p-4 rounded-xl mt-2">
                <p className="text-gray-800">{post.text}</p>
              </div>

              {/* Interaction Options */}
              <div className="flex space-x-4 justify-between mt-3 text-sm font-semibold italic">
                <span className="cursor-pointer underline hover:text-purple-800" onClick={() => handleLike(post._id)}>
                  Feel it! ({post.likes?.length || 0})
                </span>

                <span
                  className="cursor-pointer underline hover:text-purple-800"
                  onClick={() => setShowInput({ ...showInput, [post._id]: true })}
                >
                  Add your vibe
                </span>
              </div>

              {/* Comment Input */}
              {showInput[post._id] && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={newComments[post._id] || ""}
                    onChange={(e) => setNewComments({ ...newComments, [post._id]: e.target.value })}
                    placeholder="Type your comment..."
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleAddComment(post._id)}
                    className="mt-2 bg-purple-600 text-white text-sm font-medium py-1 px-3 rounded-full"
                  >
                    Add your vibe
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="mt-3 space-y-2">
                {post.comments?.map((comment) => (
                  <div key={comment._id} className="bg-gray-300 p-2 rounded-lg flex justify-between">
                    <p className="text-sm text-gray-800">
                      <strong>{comment.user === user?.id ? "Me" : comment.userName}:</strong> {comment.text}
                    </p>
                    {comment.user === user?.id && (
                      <button onClick={() => handleDeleteComment(post._id, comment._id)} className="text-red-500">❌</button>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Friends & Messages */}
      <div className="w-[250px]">
        {/* Friends List */}
        <div className="bg-gray-200 shadow-lg rounded-3xl p-4 mb-4">
          <h2 className="font-bold text-lg mb-4">Friends</h2>
          {["John Doe", "Jane Smith", "Alice Brown", "Bob White", "Emily Green"].map((pal, index) => (
            <div key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-300 p-2 rounded-lg">
              <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-8 h-8 rounded-full" />
              <span className="font-semibold">{pal}</span>
            </div>
          ))}
        </div>

        {/* Messages List */}
        <div className="bg-gray-200 shadow-lg rounded-3xl p-4">
          <h2 className="font-bold text-lg mb-4">Messages</h2>
          {["John Doe", "Jane Smith", "Alice Brown", "Bob White", "Emily Green"].map((pal, index) => (
            <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-300 p-2 rounded-lg">
              <div className="flex items-center space-x-3">
                <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-8 h-8 rounded-full" />
                <span className="font-semibold">{pal}</span>
              </div>
              <span className="text-gray-500">Hey...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
