"use client";
import { useState, useEffect, useRef } from "react";
import {
  fetchPosts,
  createPost,
  likePost,
  addComment,
  deletePost,
  deleteComment,
  fetchRandomUsers,
  fetchChatUsers,
  fetchMessages,
  sendMessage,
} from "@/app/utils/api";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [showInput, setShowInput] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
      fetchPosts();
      fetchFriends();
      getSuggestedUsers();
    }
  }, [isLoading]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if (!loggedInUser) return;

      const response = await axios.get(
        `${API_BASE_URL}/api/auth/user/${loggedInUser.id}`
      );
      setFriends(response.data.friends);
    } catch (error) {
      console.error("❌ Error fetching friends:", error);
    }
  };

  const getSuggestedUsers = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return;

      const response = await axios.get(
        `${API_BASE_URL}/api/auth/random-users?userId=${storedUser.id}`
      );
      setSuggestedUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching suggested users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to post.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/posts`,
        { text: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts([response.data, ...posts]);
      setMessage("");
    } catch (error) {
      console.error("❌ Error creating post:", error);
    }
  };

  const handleLike = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to like posts.");
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === id ? { ...post, likes: [...post.likes, user.id] } : post
      )
    );

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Like response:", response.data);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === id ? response.data : post))
      );
    } catch (error) {
      console.error("❌ Error liking post:", error);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id
            ? { ...post, likes: post.likes.filter((like) => like !== user.id) }
            : post
        )
      );

      alert("Failed to like post.");
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComments[postId]?.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to comment.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/posts/${postId}/comment`,
        { comment: newComments[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(
        posts.map((post) => (post._id === postId ? response.data : post))
      );
      setNewComments({ ...newComments, [postId]: "" });
      setShowInput({ ...showInput, [postId]: false });
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((post) => post._id !== id));
    } catch (error) {
      console.error("❌ Error deleting post:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: response.data.post.comments }
            : post
        )
      );
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
    }
  };

  const handleUnfriend = async (friendId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to unfriend.");
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/auth/unfriend/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(friends.filter((friend) => friend._id !== friendId));
    } catch (error) {
      console.error("❌ Error unfriending:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-10 mt-20">
      <div className="w-[250px] bg-gray-200 shadow-lg rounded-3xl p-4 h-fit">
        <h2 className="font-bold text-lg mb-4">Suggested Vibe Pals</h2>
        <ul className="space-y-3">
          {suggestedUsers.map((pal) => (
            <li
              key={pal._id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-300 p-2 rounded-lg"
              onClick={() => router.push(`/Profile/${pal._id}`)}
            >
              <img
                src="https://i.pravatar.cc/40"
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold">{pal.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-[650px] mx-10 h-screen overflow-y-auto scrollbar-hide">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-3xl p-6 flex flex-col items-center relative"
        >
          <p className="text-lg font-medium mb-3">
            Got a vibe? Let's hear it. 🌐
          </p>
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

        <div className="mt-10 space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-200 shadow-lg rounded-3xl p-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-bold italic">{post.userName}</p>
                </div>
                {user?.id === post.user && (
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                )}
              </div>

              <div className="bg-gray-100 p-4 rounded-xl mt-2">
                <p className="text-gray-800">{post.text}</p>
              </div>

              <div className="flex space-x-4 justify-between mt-3 text-sm font-semibold italic">
                <span
                  className="cursor-pointer underline hover:text-purple-800"
                  onClick={() => handleLike(post._id)}
                >
                  Feel it! ({post.likes?.length || 0})
                </span>

                <span
                  className="cursor-pointer underline hover:text-purple-800"
                  onClick={() =>
                    setShowInput({ ...showInput, [post._id]: true })
                  }
                >
                  Add your vibe
                </span>
              </div>

              {showInput[post._id] && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={newComments[post._id] || ""}
                    onChange={(e) =>
                      setNewComments({
                        ...newComments,
                        [post._id]: e.target.value,
                      })
                    }
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

              <div className="mt-3 space-y-2">
                {post.comments?.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-300 p-2 rounded-lg flex justify-between"
                  >
                    <p className="text-sm text-gray-800">
                      <strong>
                        {comment.user === user?.id ? "Me" : comment.userName}:
                      </strong>{" "}
                      {comment.text}
                    </p>
                    {comment.user === user?.id && (
                      <button
                        onClick={() =>
                          handleDeleteComment(post._id, comment._id)
                        }
                        className="text-red-500"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[250px]">
        <div className="bg-gray-200 shadow-lg rounded-3xl p-4 mb-4">
          <h2 className="font-bold text-lg mb-4">Friends</h2>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-300 p-2 rounded-lg"
              >
                <div
                  className="flex items-center space-x-3"
                  onClick={() => {
                    console.log("Navigating to profile:", friend._id);
                    router.push(`/Profile/${friend._id}`);
                  }}
                >
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold">{friend.name}</span>
                </div>
                <button
                  onClick={() => handleUnfriend(friend._id)}
                  className="text-red-500 text-sm"
                >
                  Unfriend
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No friends yet.</p>
          )}
        </div>

        <div className="w-[250px] bg-gray-200 shadow-lg rounded-3xl p-4">
          <h2 className="font-bold text-lg mb-4">Messages</h2>

          {chatUsers.length > 0 ? (
            chatUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-300 p-2 rounded-lg transition"
                onClick={() => openChat(user._id)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold">{user.name}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No chats yet.</p>
          )}

          {selectedChat && (
            <div className="fixed bottom-10 right-10 w-[320px] bg-white p-4 shadow-2xl rounded-2xl border border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Chat</h3>
                <button
                  onClick={closeChat}
                  className="text-red-500 hover:text-red-700 text-lg font-bold transition"
                  aria-label="Close chat"
                >
                  ✖
                </button>
              </div>

              <div className="h-64 overflow-y-auto space-y-2 p-2 border rounded-lg bg-gray-100 flex flex-col">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id || Math.random()}
                      className={`flex ${
                        msg.sender === selectedChat
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`p-2 max-w-[75%] rounded-lg ${
                          msg.sender === selectedChat
                            ? "bg-gray-300 text-black self-start"
                            : "bg-purple-500 text-white self-end"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center">
                    No messages yet.
                  </p>
                )}
              </div>

              <div className="flex mt-3">
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg outline-none focus:ring-2 focus:ring-purple-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
