"use client"; // Make this a Client Component

import { signIn, useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";
import Image from "next/image";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import UserDashboard from "@/components/UserDashboard";
import Link from "next/link";
import ShopInterface from "@/components/shop/ShopInterface";

export default function Home() {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const strikeElement = document.getElementById("stuckText");
    if (strikeElement) {
      setTimeout(() => {
        strikeElement.classList.add("change-color");
      }, 500);
    }
  }, []);

  useEffect(() => {
    async function checkUserRole() {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user-role?email=${encodeURIComponent(session.user.email)}`);
          const data = await response.json();
          setUserRole(data.role);
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setUserRole("customer"); // Default to customer on error
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    if (session) {
      checkUserRole();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (session) {
    if (loading) {
      return (
        <>
          <NavBar />
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </>
      );
    }

    return (
      <>
        <NavBar />
        <div className="mb-16">
          {userRole === "owner" ? <ShopInterface /> : <UserDashboard />}
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar></NavBar>
      <div className="flex w-screen">
        <div className="w-[50vw] h-screen flex justify-center items-center">
          <Image
            src="/printer.webp"
            alt="printer"
            width={700}
            height={700}
            className="h-auto w-auto py-[13rem] px-[10rem] opacity-90 animate-slowJump"
          ></Image>
        </div>

        <div className="w-[50vw] h-screen flex flex-col items-center justify-center content-center">
          <div>
            <h1 className="text-5xl font-bold">
              Push.&nbsp;&nbsp;&nbsp;Pay.&nbsp;&nbsp;&nbsp;Pick-Up.
            </h1>
          </div>
          <div className="flex items-center justify-center text-4xl font-[300] gap-5 mt-4">
            <span
              id="stuckText"
              className="text-green-400"
              style={{
                textDecoration: "line-through",
                textDecorationThickness: "3px",
              }}
            >
              Stuck in line?
            </span>{" "}
            <span className="font-[500]">&nbsp;Use </span>{" "}
            <Image
              src="/pexl-logo.svg"
              alt="PEXL"
              width={1}
              height={50}
              style={{ height: "60px", width: "auto" }}
              className="mt-[0.4rem]"
            />
          </div>

          <hr className="w-[60%] my-8" />
          <div className="mt-8">
            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <Image src="/google.svg" alt="Google" width={18} height={18} />
              <span className="font-medium">Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
