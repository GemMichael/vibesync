"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
    const [activeTab, setActiveTab] = useState("home");
    const router = useRouter();

    const handleNavigation = (tab) => {
        setActiveTab(tab);
        router.push(`/${tab}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); 
        router.push("/Login"); 
    };

    return (
        <section className="fixed top-0 z-50 w-full px-6 xl:px-0 transition-all duration-300 bg-white shadow-md">
            <div className="flex items-center justify-between max-w[1160px] w-full py-5 mx-auto">

                <div className="flex items-center ml-10">
                    <Image src="/images/V.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
                </div>


                <div className="flex gap-8 text-black">
                    <Search className="w-6 h-6 cursor-pointer" />
                    
                    <div className="relative">
                        <Home
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => handleNavigation("")}
                        />
                        {activeTab === "home" && (
                            <motion.div
                                layoutId="underline"
                                className="absolute left-0 right-0 h-1 bg-violet-500 rounded-full -bottom-2"
                            />
                        )}
                    </div>

                    <div className="relative">
                        <User
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => handleNavigation("Profile")} 
                        />
                        {activeTab === "Profile" && (
                            <motion.div
                                layoutId="underline"
                                className="absolute left-0 right-0 h-1 bg-violet-500 rounded-full -bottom-2"
                            />
                        )}
                    </div>

                    
                    <LogOut 
                        className="w-6 h-6 mr-5 cursor-pointer text-red-500 hover:text-red-700 transition"
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </section>
    );
}
