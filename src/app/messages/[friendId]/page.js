"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchMessages, sendMessage, fetchUser } from "@/app/utils/api";

export default function Messages() {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friendName, setFriendName] = useState("Unknown User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friendId) return;

    const loadMessages = async () => {
      try {
        const data = await fetchMessages(friendId);
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadFriendDetails = async () => {
      try {
        const userData = await fetchUser(friendId);
        if (userData) setFriendName(userData.name);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    loadMessages();
    loadFriendDetails();
  }, [friendId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const sentMessage = await sendMessage(friendId, newMessage);
      if (sentMessage) {
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (msg) => msg._id === sentMessage._id
          );
          return isDuplicate ? prevMessages : [...prevMessages, sentMessage];
        });
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10">
      <h1 className="text-3xl font-bold">Chat with {friendName}</h1>

      <div className="w-full max-w-lg p-4 bg-white shadow-lg rounded-lg">
        <div className="h-96 overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id || Math.random()}
                className={`p-2 rounded-lg ${
                  msg.sender === friendId
                    ? "bg-gray-300 text-black"
                    : "bg-purple-400 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No messages yet.</p>
          )}
        </div>

        <div className="flex mt-4">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-lg"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-r-lg"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
