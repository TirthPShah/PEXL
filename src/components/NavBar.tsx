"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
// import logo
import Image from 'next/image'

export default function NavBar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown if clicked outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-md z-50 shadow-sm">
      {/* Left Side: Logo */}
      <div className="text-2xl font-bold">
        <Link href="/"><Image src="/pexl-logo.svg" alt="PEXL" width={1} height={50} style={{ height: "45px", width: "auto" }}/></Link>
      </div>

      {/* Middle: Navigation Links */}
      <nav className="flex space-x-6">
        <Link href="/pricing" className="hover:text-blue-500 text-lg">
          Pricing
        </Link>
        <Link href="/stores" className="hover:text-blue-500 text-lg">
          Stores
        </Link>
        {session && (
          <Link href="/my-orders" className="hover:text-blue-500 text-lg">
            My Orders
          </Link>
        )}
      </nav>

      {/* Right Side: Avatar and Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center focus:outline-none"
        >
          {session && session.user?.image ? (
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg py-2 z-50">
            {!session ? (
              <button
                onClick={() => signIn("google")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                LogIn/SignUp
              </button>
            ) : (
              <>
                <Link
                  href="/my-orders"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
