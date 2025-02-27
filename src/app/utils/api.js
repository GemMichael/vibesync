import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; 
const POSTS_API = `${API_BASE_URL}/posts`;
const AUTH_API = `${API_BASE_URL}/auth`;

const getAuthHeaders = () => {
    if (typeof window === "undefined") return {}; 
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// ✅ Fetch all posts
export const fetchPosts = async () => {
    try {
        const response = await axios.get(POSTS_API);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching posts:", error.response?.data || error.message);
        return [];
    }
};

// ✅ Create a new post
export const createPost = async (text) => {
    try {
        const response = await axios.post(POSTS_API, { text }, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("❌ Error creating post:", error.response?.data || error.message);
        return null;
    }
};

// ✅ Like a post
export const likePost = async (id) => {
    try {
        console.log(`👍 Attempting to like post with ID: ${id}`);
        const response = await axios.patch(`${POSTS_API}/${id}/like`, {}, getAuthHeaders());
        console.log("✅ Like response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error liking post:", error.response?.data || error.message);
        return null;
    }
};

// ✅ Add a comment
export const addComment = async (postId, comment) => {
    try {
        const response = await axios.post(`${POSTS_API}/${postId}/comment`, { comment }, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("❌ Error adding comment:", error.response?.data || error.message);
        return null;
    }
};

// ✅ Delete a comment
export const deleteComment = async (postId, commentId) => {
    try {
        console.log(`🗑️ Deleting comment: Post ID: ${postId}, Comment ID: ${commentId}`);
        const response = await axios.delete(`${POSTS_API}/${postId}/comments/${commentId}`, getAuthHeaders());
        console.log("✅ Comment deleted:", response.data);
        return response.data.updatedPost;
    } catch (error) {
        console.error("❌ Error deleting comment:", error.response?.data || error.message);
        return null;
    }
};

// ✅ Delete a post
export const deletePost = async (id) => {
    try {
        const response = await axios.delete(`${POSTS_API}/${id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting post:", error.response?.data || error.message);
        return null;
    }
};

// ✅ Fetch random users (except current user)
export const fetchRandomUsers = async (userId) => {
    try {
        if (!userId) return [];
        const response = await axios.get(`${AUTH_API}/random-users`, { params: { userId } });
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching random users:", error.response?.data || error.message);
        return [];
    }
};

// ✅ Fetch posts of the logged-in user
export const fetchUserPosts = async (userId) => {
    try {
        if (!userId) return [];
        const response = await axios.get(`${POSTS_API}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching user posts:", error.response?.data || error.message);
        return [];
    }
};

// ✅ Fetch user details by ID
export const fetchUserById = async (userId) => {
    try {
        if (!userId) return null;
        const response = await axios.get(`${AUTH_API}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching user:", error.response?.data || error.message);
        return null;
    }
};

// ✅ Search for users
export const searchUsers = async (query) => {
    try {
        if (!query.trim()) return [];
        const response = await axios.get(`${AUTH_API}/search`, { params: { query } });
        return response.data;
    } catch (error) {
        console.error("❌ Error searching users:", error.response?.data || error.message);
        return [];
    }
};
