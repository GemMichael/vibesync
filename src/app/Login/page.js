"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-purple-600 text-center mb-6">
          VibeSync 🌐
        </h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 mb-3 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 mb-4 border rounded-lg"
            onChange={handleChange}
            required
          />
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
            Login
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          No account?{" "}
          <a href="/Signup" className="text-purple-600 hover:underline">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}
