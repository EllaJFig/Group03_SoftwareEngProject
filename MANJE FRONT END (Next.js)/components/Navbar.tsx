"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full fixed top-4 left-0 z-50 flex justify-center">
      <div className="
        bg-black 
        border border-white/20 
        rounded-full 
        px-8 py-4 
        flex items-center justify-between 
        w-[90%] 
        max-w-6xl 
        shadow-lg
      ">
        
        {/* LEFT — LOGO */}
        <Link href="/" className="text-2xl font-bold text-blue-500">
          MANJE
        </Link>

        {/* CENTER LINKS */}
<div className="flex items-center space-x-8 text-white font-medium">
  <Link href="/" className="hover:text-blue-400 transition">Home</Link>
  <Link href="/map" className="hover:text-blue-400 transition">Map</Link>
  <Link href="/saved" className="hover:text-blue-400 transition">Saved</Link>
  <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
  <Link href="/profile" className="hover:text-blue-400 transition">Profile</Link>
</div>


        {/* RIGHT — LOGIN BUTTON */}
        <Link
          href="/login"
          className="px-5 py-2 border border-blue-500 text-blue-500 rounded-full 
                     hover:bg-blue-600 hover:text-white transition"
        >
          Login
        </Link>

      </div>
    </nav>
  );
}
