import axios from "axios";

const API_URL = "http://localhost:5000/api/posts";


const getAuthHeaders = () => {
    if (typeof window === "undefined") return {}; 
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};



export const fetchPosts = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
};


export const createPost = async (text) => {
    try {
        const response = await axios.post(API_URL, { text }, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error creating post:", error);
        return null;
    }
};


export const likePost = async (id) => {
    try {
        console.log(`Attempting to like post with ID: ${id}`); 
        const response = await axios.patch(`${API_URL}/${id}/like`, {}, { headers: getAuthHeaders() });
        console.log("Like response:", response.data); 
        return response.data;
    } catch (error) {
        console.error("Error liking post:", error.response?.data || error.message); 
        return null;
    }
};




export const addComment = async (id, comment) => {
    try {
        const response = await axios.post(`${API_URL}/${id}/comment`, { comment }, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error adding comment:", error);
        return null;
    }
};


