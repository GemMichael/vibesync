"use client";
import { useState } from "react";

export default function ProfilePage() {
  const user = {
    name: "John Doe",
    avatar: "https://i.pravatar.cc/100", 
  };

  const vibePals = Array(6).fill(user); 
  const friends = Array(6).fill(user); 
  const messages = Array(6).fill({ user, text: "Hello...................." });

  const posts = [
    { id: 1, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { id: 2, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 mt-20">
      <div className="flex items-center space-x-4">
        <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-300" />
        <div>
          <h1 className="text-3xl font-bold italic">{user.name}</h1>
          <p className="text-gray-600 font-semibold">Pals</p>
          <hr className="border-purple-500 mt-1 w-20" />
        </div>
      </div>


      <div className="flex w-full max-w-6xl mt-8">
        <div className="w-1/4 p-4 bg-gray-200 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold italic underline">Suggested Vibe Pals</h2>
          <div className="mt-3 space-y-2">
            {vibePals.map((pal, index) => (
              <div key={index} className="flex items-center space-x-3">
                <img src={pal.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                <span className="font-bold italic cursor-pointer">{pal.name}</span>
              </div>
            ))}
          </div>
        </div>


        <div className="flex-1 p-4">
          <div className="p-6 bg-white shadow-lg rounded-3xl">
            <h2 className="text-lg font-semibold mb-2">Info</h2>
            <p className="text-gray-600">Info</p>
            <p className="text-gray-600">Info</p>
            <p className="text-gray-600">Info</p>
          </div>

          <div className="mt-6 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-200 shadow-lg rounded-3xl p-4">
                <div className="flex items-center space-x-3">
                  <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
                  <p className="font-bold italic">{user.name}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl mt-2">
                  <p className="text-gray-800">{post.text}</p>
                </div>
                <div className="flex justify-between mt-3 text-sm font-semibold italic">
                  <span className="cursor-pointer underline">Feel it!</span>
                  <span className="cursor-pointer underline">Add your vibe</span>
                  <span className="cursor-pointer underline">Spread the vibe</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/4 space-y-6 p-4">
          <div className="bg-gray-200 p-4 rounded-3xl shadow-lg">
            <h2 className="text-lg font-semibold italic underline">Friends</h2>
            <div className="mt-3 space-y-2">
              {friends.map((friend, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img src={friend.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <span className="font-bold italic cursor-pointer">{friend.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-200 p-4 rounded-3xl shadow-lg">
            <h2 className="text-lg font-semibold italic underline">Messages</h2>
            <div className="mt-3 space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img src={msg.user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <span className="font-bold italic cursor-pointer">{msg.user.name}</span>
                  <span className="text-gray-600 text-sm">{msg.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
