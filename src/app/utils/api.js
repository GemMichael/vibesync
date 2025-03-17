import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const POSTS_API = `${API_BASE_URL}/posts`;
const AUTH_API = `${API_BASE_URL}/auth`;

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const fetchPosts = async () => {
  try {
    const response = await axios.get(POSTS_API);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching posts:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const createPost = async (text) => {
  try {
    const response = await axios.post(POSTS_API, { text }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating post:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const likePost = async (id) => {
  try {
    console.log(`👍 Attempting to like post with ID: ${id}`);
    const response = await axios.patch(
      `${POSTS_API}/${id}/like`,
      {},
      getAuthHeaders()
    );
    console.log("✅ Like response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error liking post:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const addComment = async (postId, comment) => {
  try {
    const response = await axios.post(
      `${POSTS_API}/${postId}/comment`,
      { comment },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error adding comment:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    console.log(
      `🗑️ Deleting comment: Post ID: ${postId}, Comment ID: ${commentId}`
    );
    const response = await axios.delete(
      `${POSTS_API}/${postId}/comments/${commentId}`,
      getAuthHeaders()
    );
    console.log("✅ Comment deleted:", response.data);
    return response.data.updatedPost;
  } catch (error) {
    console.error(
      "❌ Error deleting comment:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${POSTS_API}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error deleting post:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const fetchRandomUsers = async (userId) => {
  try {
    if (!userId) return [];

    const response = await axios.get(`${AUTH_API}/random-users`, {
      params: { userId },
    });
    const friendsResponse = await axios.get(`${AUTH_API}/user/${userId}`);

    const friendsList = friendsResponse.data.friends.map((f) => f._id);

    return response.data.filter((user) => !friendsList.includes(user._id));
  } catch (error) {
    console.error(
      "❌ Error fetching random users:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    if (!userId) return [];
    const response = await axios.get(`${POSTS_API}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching user posts:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const fetchUserById = async (userId) => {
  try {
    if (!userId) return null;
    const response = await axios.get(`${AUTH_API}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching user:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const searchUsers = async (query) => {
  try {
    if (!query.trim()) return [];
    const response = await axios.get(`${AUTH_API}/search`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error searching users:",
      error.response?.data || error.message
    );
    return [];
  }
};
export const sendMessage = async (recipientId, text) => {
  try {
    const response = await axios.post(
      `${AUTH_API}/message/${recipientId}`,
      { text },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const fetchMessages = async (friendId) => {
  try {
    const response = await axios.get(
      `${AUTH_API}/messages/${friendId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching messages:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const fetchUser = async (userId) => {
  try {
    const response = await axios.get(
      `${AUTH_API}/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user details:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const fetchChatUsers = async () => {
  try {
    const response = await axios.get(      `${AUTH_API}/chats`,
      {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching chat users:",
      error.response?.data || error.message
    );
    return [];
  }
};
