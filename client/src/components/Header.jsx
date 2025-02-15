"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Initialize router

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">My App</h1>
      <div className="relative">
        <button onClick={toggleDropdown} className="focus:outline-none">
          {/* Replace the src with your profile image or use an icon library */}
          <img
            src="/profile-placeholder.png"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
