"use client"; // Make this a Client Component

import { signOut, signIn, useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";
import Image from "next/image";
import "@/app/globals.css";
import { useEffect } from "react";
import UserDashboard from "@/components/UserDashboard";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  useEffect(() => {
    const strikeElement = document.getElementById("stuckText");
    if (strikeElement) {
      setTimeout(() => {
        strikeElement.classList.add("change-color");
      }, 500);
    }
  }, []);

  if (session) {
    return (
      <>
        <NavBar />
        <div className="mb-16">
        <UserDashboard/>
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
